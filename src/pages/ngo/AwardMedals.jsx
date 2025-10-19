import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Award, X, Search } from 'lucide-react';
import '../../styles/AwardMedals.css';

const MEDAL_TEMPLATES = [
  { icon: '🥇', name: 'Gold Star', description: 'Outstanding performance and dedication' },
  { icon: '🏆', name: 'Champion', description: 'Exceptional contribution to the cause' },
  { icon: '⭐', name: 'Super Volunteer', description: 'Going above and beyond expectations' },
  { icon: '💎', name: 'Diamond Contributor', description: 'Rare and valuable contributions' },
  { icon: '🎖️', name: 'Excellence Award', description: 'Demonstrated excellence in service' },
  { icon: '👑', name: 'Impact Leader', description: 'Made significant positive impact' },
  { icon: '🌟', name: 'Shining Star', description: 'Consistent outstanding work' },
  { icon: '🦸', name: 'Community Hero', description: 'Heroic effort for the community' },
  { icon: '💪', name: 'Dedication Medal', description: 'Unwavering commitment and effort' },
  { icon: '🎯', name: 'Goal Achiever', description: 'Successfully met all targets' },
];

const AwardMedals = () => {
  const { currentUser } = useAuth();
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedMedal, setSelectedMedal] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const ngo = useQuery(
    api.ngos.getNGOByUserId,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  // Get active matches (volunteers working with this NGO)
  const matches = useQuery(
    api.matches.getMatchesForUser,
    ngo?._id ? { ngoId: ngo._id } : 'skip'
  );

  const awardMedal = useMutation(api.achievements.awardCustomMedal);

  const handleAwardClick = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowAwardModal(true);
  };

  const handleSelectMedal = (medal) => {
    setSelectedMedal(medal);
    setCustomName(medal.name);
    setCustomDescription(medal.description);
  };

  const handleAwardMedal = async () => {
    if (!selectedVolunteer || !selectedMedal || !customName || !customDescription) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await awardMedal({
        userId: selectedVolunteer._id,
        ngoId: ngo._id,
        name: customName,
        description: customDescription,
        icon: selectedMedal.icon,
      });

      alert(`Medal awarded to ${selectedVolunteer.name}!`);
      setShowAwardModal(false);
      setSelectedVolunteer(null);
      setSelectedMedal(null);
      setCustomName('');
      setCustomDescription('');
    } catch (error) {
      console.error('Error awarding medal:', error);
      alert('Failed to award medal. Please try again.');
    }
  };

  // Filter volunteers by search
  const filteredMatches = matches?.filter(match => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return match.volunteer?.name?.toLowerCase().includes(query) ||
           match.opportunity?.title?.toLowerCase().includes(query);
  });

  return (
    <div className="award-medals-page">
      <div className="page-header">
        <div>
          <h1>Award Medals</h1>
          <p>Recognize outstanding volunteers with special achievements</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search volunteers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Volunteers List */}
      <div className="volunteers-grid">
        {!filteredMatches || filteredMatches.length === 0 ? (
          <div className="empty-state">
            <Award size={64} />
            <h2>No Active Volunteers</h2>
            <p>You don't have any active volunteers to award medals to yet.</p>
          </div>
        ) : (
          filteredMatches.map((match) => (
            <div key={match._id} className="volunteer-card">
              <div className="volunteer-header">
                <img
                  src={match.volunteer?.profilePicture || 'https://via.placeholder.com/60'}
                  alt={match.volunteer?.name}
                  className="volunteer-avatar"
                />
                <div className="volunteer-info">
                  <h3>{match.volunteer?.name}</h3>
                  <p className="volunteer-opportunity">{match.opportunity?.title}</p>
                  <div className="volunteer-stats">
                    <span>{match.volunteer?.tasksCompleted || 0} tasks completed</span>
                    <span>•</span>
                    <span>{match.volunteer?.totalHoursVolunteered || 0}h volunteered</span>
                  </div>
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleAwardClick(match.volunteer)}
              >
                <Award size={16} />
                Award Medal
              </button>
            </div>
          ))
        )}
      </div>

      {/* Award Modal */}
      {showAwardModal && (
        <div className="modal-overlay" onClick={() => setShowAwardModal(false)}>
          <div className="modal-content award-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Award Medal to {selectedVolunteer?.name}</h2>
              <button className="close-btn" onClick={() => setShowAwardModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="medal-templates">
                <h3>Select a Medal Template</h3>
                <div className="medals-grid">
                  {MEDAL_TEMPLATES.map((medal, index) => (
                    <div
                      key={index}
                      className={`medal-template ${selectedMedal?.icon === medal.icon ? 'selected' : ''}`}
                      onClick={() => handleSelectMedal(medal)}
                    >
                      <span className="medal-icon">{medal.icon}</span>
                      <span className="medal-name">{medal.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMedal && (
                <div className="medal-customize">
                  <h3>Customize Medal</h3>
                  <div className="form-group">
                    <label>Medal Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Enter medal name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Why are you awarding this medal?"
                      rows="3"
                    />
                  </div>

                  <div className="medal-preview">
                    <h4>Preview</h4>
                    <div className="preview-card">
                      <span className="preview-icon">{selectedMedal.icon}</span>
                      <div>
                        <h5>{customName || 'Medal Name'}</h5>
                        <p>{customDescription || 'Medal description'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAwardModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAwardMedal}
                disabled={!selectedMedal || !customName || !customDescription}
              >
                <Award size={18} />
                Award Medal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AwardMedals;

