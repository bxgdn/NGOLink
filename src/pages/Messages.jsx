import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Send, Search, ArrowLeft, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import '../styles/Messages.css';

const Messages = () => {
  const { currentUser, user } = useAuth();
  const navigate = useNavigate();
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const isVolunteer = currentUser?.userType === 'volunteer';
  const isNGO = currentUser?.userType === 'ngo';

  // Get NGO for NGO users
  const ngo = useQuery(
    api.ngos.getNGOByUserId,
    isNGO && currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  // Get all matches with messages for the current user
  const matches = useQuery(
    api.matches.getMatchesForUser,
    isVolunteer && currentUser?.userId 
      ? { userId: currentUser.userId } 
      : isNGO && ngo?._id
      ? { ngoId: ngo._id }
      : 'skip'
  );

  // Get messages for selected match
  const messages = useQuery(
    api.messages.getMessagesForMatch,
    selectedMatchId ? { matchId: selectedMatchId } : 'skip'
  );

  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markMessagesAsRead);

  // Get selected match details
  const selectedMatch = matches?.find(m => m._id === selectedMatchId);

  useEffect(() => {
    if (messages && selectedMatchId && currentUser?.userId) {
      markAsRead({ matchId: selectedMatchId, userId: currentUser.userId });
    }
  }, [messages, selectedMatchId, currentUser?.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedMatchId) return;

    try {
      await sendMessage({
        matchId: selectedMatchId,
        senderId: currentUser.userId,
        senderType: isVolunteer ? 'volunteer' : 'ngo',
        content: message.trim(),
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Filter matches by search query
  const filteredMatches = matches?.filter(match => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    if (isVolunteer) {
      return match.ngo?.organizationName?.toLowerCase().includes(query) ||
             match.opportunity?.title?.toLowerCase().includes(query);
    } else {
      return match.volunteer?.name?.toLowerCase().includes(query) ||
             match.opportunity?.title?.toLowerCase().includes(query);
    }
  });

  // Auto-select first match if none selected
  useEffect(() => {
    if (filteredMatches && filteredMatches.length > 0 && !selectedMatchId) {
      setSelectedMatchId(filteredMatches[0]._id);
    }
  }, [filteredMatches, selectedMatchId]);

  const getLastMessage = (match) => {
    return match.lastMessage || 'No messages yet';
  };

  const getLastMessageTime = (match) => {
    if (!match.lastMessageTime) return '';
    return format(match.lastMessageTime, 'MMM d');
  };

  return (
    <div className="messages-page">
      {/* Conversations List */}
      <div className="conversations-sidebar">
        <div className="conversations-header">
          <h2>Messages</h2>
          <div className="search-messages">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="conversations-list">
          {!filteredMatches || filteredMatches.length === 0 ? (
            <div className="empty-conversations">
              <MessageCircle size={48} />
              <p>No conversations yet</p>
              <span>
                {isVolunteer 
                  ? 'Apply to opportunities to start chatting with organizations'
                  : 'Accept applications to start chatting with volunteers'}
              </span>
            </div>
          ) : (
            filteredMatches.map((match) => {
              const otherParty = isVolunteer ? match.ngo : match.volunteer;
              const isSelected = selectedMatchId === match._id;
              
              return (
                <div
                  key={match._id}
                  className={`conversation-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedMatchId(match._id)}
                >
                  <img
                    src={
                      isVolunteer 
                        ? (otherParty?.logo || 'https://via.placeholder.com/48')
                        : (otherParty?.profilePicture || 'https://via.placeholder.com/48')
                    }
                    alt={isVolunteer ? otherParty?.organizationName : otherParty?.name}
                    className="conversation-avatar"
                  />
                  <div className="conversation-info">
                    <div className="conversation-header-row">
                      <h4>{isVolunteer ? otherParty?.organizationName : otherParty?.name}</h4>
                      <span className="conversation-time">{getLastMessageTime(match)}</span>
                    </div>
                    <p className="opportunity-title">{match.opportunity?.title}</p>
                    <p className="last-message">{getLastMessage(match)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedMatch ? (
        <div className="chat-area">
          <div className="chat-header-bar">
            <div className="chat-header-info">
              <img
                src={
                  isVolunteer 
                    ? (selectedMatch.ngo?.logo || 'https://via.placeholder.com/40')
                    : (selectedMatch.volunteer?.profilePicture || 'https://via.placeholder.com/40')
                }
                alt="Avatar"
                className="chat-header-avatar"
              />
              <div>
                <h3>
                  {isVolunteer 
                    ? selectedMatch.ngo?.organizationName 
                    : selectedMatch.volunteer?.name}
                </h3>
                <p className="chat-opportunity-name">{selectedMatch.opportunity?.title}</p>
              </div>
            </div>
          </div>

          <div className="chat-messages-area">
            {!messages || messages.length === 0 ? (
              <div className="empty-chat">
                <MessageCircle size={64} />
                <p>No messages yet</p>
                <span>Start the conversation!</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.senderId === currentUser?.userId;
                return (
                  <div 
                    key={msg._id} 
                    className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                  >
                    {!isOwnMessage && (
                      <img 
                        src={msg.senderPicture || 'https://via.placeholder.com/32'}
                        alt={msg.senderName}
                        className="message-avatar"
                      />
                    )}
                    <div className="message-content">
                      <div className="message-bubble">
                        <p>{msg.content}</p>
                      </div>
                      <span className="message-time">
                        {format(msg.createdAt, 'h:mm a')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="message-input"
            />
            <button type="submit" className="send-button" disabled={!message.trim()}>
              <Send size={20} />
            </button>
          </form>
        </div>
      ) : (
        <div className="no-conversation-selected">
          <MessageCircle size={64} />
          <h3>Select a conversation</h3>
          <p>Choose a conversation from the list to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default Messages;

