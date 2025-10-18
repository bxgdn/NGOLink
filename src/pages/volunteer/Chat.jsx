import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import '../../styles/Chat.css';

const Chat = () => {
  const { matchId } = useParams();
  const { currentUser, user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const match = useQuery(
    api.matches.getMatch,
    matchId ? { matchId } : 'skip'
  );

  const messages = useQuery(
    api.messages.getMessagesForMatch,
    matchId ? { matchId } : 'skip'
  );

  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markMessagesAsRead);

  useEffect(() => {
    if (messages && currentUser?.userId) {
      markAsRead({ matchId, userId: currentUser.userId });
    }
  }, [messages, matchId, currentUser?.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({
        matchId,
        senderId: currentUser.userId,
        senderType: 'volunteer',
        content: message.trim(),
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!match) return <div>Loading...</div>;

  const otherParty = match.ngo;

  return (
    <div className="chat-page">
      <div className="chat-header">
        <img 
          src={otherParty?.logo || 'https://via.placeholder.com/50'}
          alt={otherParty?.organizationName}
          className="chat-avatar"
        />
        <div>
          <h2>{otherParty?.organizationName}</h2>
          <p>{match.opportunity?.title}</p>
        </div>
      </div>

      <div className="chat-messages">
        {!messages || messages.length === 0 ? (
          <div className="empty-chat">
            <p>No messages yet. Start the conversation!</p>
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

      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="send-btn" disabled={!message.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;

