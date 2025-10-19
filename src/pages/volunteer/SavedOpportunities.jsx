import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Star, Heart, MapPin, Clock, Trash2 } from 'lucide-react';
import '../../styles/SavedOpportunities.css';

const SavedOpportunities = () => {
  const { currentUser } = useAuth();

  const savedOpportunities = useQuery(
    api.matches.getSavedOpportunitiesForUser,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const applyToOpportunity = useMutation(api.matches.swipeOpportunity);
  const removeSaved = useMutation(api.matches.removeSavedOpportunity);

  const handleApply = async (opportunityId, ngoId) => {
    try {
      await applyToOpportunity({
        userId: currentUser.userId,
        opportunityId,
        swipeType: 'right',
      });
    } catch (error) {
      console.error('Error applying:', error);
    }
  };

  const handleRemove = async (swipeId) => {
    try {
      await removeSaved({ swipeId });
    } catch (error) {
      console.error('Error removing:', error);
    }
  };

  return (
    <div className="saved-opportunities">
      <div className="page-header">
        <div>
          <h1>Saved Opportunities</h1>
          <p>Opportunities you've starred for later</p>
        </div>
      </div>

      {!savedOpportunities || savedOpportunities.length === 0 ? (
        <div className="empty-state">
          <Star size={64} />
          <h2>No Saved Opportunities</h2>
          <p>Star opportunities in the swipe deck to save them for later!</p>
        </div>
      ) : (
        <div className="saved-list">
          {savedOpportunities.map((item) => (
            <div key={item._id} className="saved-card">
              <div className="saved-header">
                <div className="saved-badge">
                  <Star size={16} fill="#EEE82C" color="#EEE82C" />
                  Saved
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item._id)}
                  title="Remove from saved"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="saved-content">
                <div className="saved-org-info">
                  <img 
                    src={item.opportunity?.ngo?.logo || 'https://via.placeholder.com/60'}
                    alt={item.opportunity?.ngo?.name}
                    className="saved-org-logo"
                  />
                  <div>
                    <h3>{item.opportunity?.title}</h3>
                    <p className="saved-org-name">{item.opportunity?.ngo?.name}</p>
                  </div>
                </div>

                <p className="saved-description">{item.opportunity?.description}</p>

                <div className="saved-meta">
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>{item.opportunity?.location}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{item.opportunity?.timeCommitment}</span>
                  </div>
                </div>

                <div className="saved-skills">
                  {item.opportunity?.requiredSkills?.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                  {item.opportunity?.requiredSkills?.length > 4 && (
                    <span className="skill-tag">+{item.opportunity.requiredSkills.length - 4}</span>
                  )}
                </div>

                <button
                  className="btn btn-primary btn-block"
                  onClick={() => handleApply(item.opportunityId, item.ngoId)}
                >
                  <Heart size={18} />
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedOpportunities;

