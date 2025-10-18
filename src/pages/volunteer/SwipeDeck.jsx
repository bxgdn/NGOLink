import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Heart, X, Star, MapPin, Clock, Filter } from 'lucide-react';
import '../../styles/SwipeDeck.css';

const SwipeDeck = () => {
  const { currentUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [superLikesLeft, setSuperLikesLeft] = useState(3);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    causeFilter: [],
    skillFilter: [],
  });

  const opportunities = useQuery(
    api.opportunities.getOpportunitiesForUser,
    currentUser?.userId ? { userId: currentUser.userId, ...filters } : 'skip'
  );

  const swipeOpportunity = useMutation(api.matches.swipeOpportunity);

  const currentOpportunity = opportunities?.[currentIndex];

  const handleSwipe = async (direction) => {
    if (!currentOpportunity) return;

    let swipeType = direction === 'right' ? 'right' : 'left';
    
    if (direction === 'super' && superLikesLeft > 0) {
      swipeType = 'super';
      setSuperLikesLeft(prev => prev - 1);
    }

    try {
      await swipeOpportunity({
        userId: currentUser.userId,
        opportunityId: currentOpportunity._id,
        swipeType,
      });

      // Move to next card
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error swiping:', error);
    }
  };

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="swipe-deck">
        <div className="swipe-header">
          <h1>Find Opportunities</h1>
          <button 
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
          </button>
        </div>
        <div className="empty-deck">
          <Heart size={64} />
          <h2>No More Opportunities</h2>
          <p>Check back later for new volunteer opportunities!</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= opportunities.length) {
    return (
      <div className="swipe-deck">
        <div className="swipe-header">
          <h1>Find Opportunities</h1>
        </div>
        <div className="empty-deck">
          <Heart size={64} />
          <h2>You've Seen Everything!</h2>
          <p>Great job! Check back later for new opportunities.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentIndex(0)}
          >
            Review Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-deck">
      <div className="swipe-header">
        <div>
          <h1>Find Opportunities</h1>
          <p className="swipe-counter">
            {currentIndex + 1} of {opportunities.length}
          </p>
        </div>
        <div className="header-actions">
          <div className="super-likes">
            <Star size={18} fill="#EEE82C" color="#EEE82C" />
            <span>{superLikesLeft} Super Likes</span>
          </div>
          <button 
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="card-container">
        {/* Show next card in background */}
        {opportunities[currentIndex + 1] && (
          <div className="opportunity-card background-card">
            <div className="card-image">
              <img 
                src={opportunities[currentIndex + 1].ngo?.coverImage || 'https://via.placeholder.com/600x300'}
                alt={opportunities[currentIndex + 1].title}
              />
            </div>
          </div>
        )}

        {/* Current card */}
        <div className="opportunity-card active-card">
          <div className="card-image">
            <img 
              src={currentOpportunity.ngo?.coverImage || 'https://via.placeholder.com/600x300'}
              alt={currentOpportunity.title}
            />
            <div className="card-badge-container">
              {currentOpportunity.cause.map((cause, idx) => (
                <span key={idx} className="card-badge">{cause}</span>
              ))}
            </div>
          </div>

          <div className="card-content">
            <div className="card-header">
              <img 
                src={currentOpportunity.ngo?.logo || 'https://via.placeholder.com/60'}
                alt={currentOpportunity.ngo?.name}
                className="ngo-logo"
              />
              <div>
                <h2>{currentOpportunity.title}</h2>
                <p className="ngo-name">{currentOpportunity.ngo?.name}</p>
              </div>
            </div>

            <p className="card-description">{currentOpportunity.description}</p>

            <div className="card-meta">
              <div className="meta-item">
                <MapPin size={18} />
                <span>{currentOpportunity.location}</span>
              </div>
              <div className="meta-item">
                <Clock size={18} />
                <span>{currentOpportunity.timeCommitment}</span>
              </div>
            </div>

            <div className="card-skills">
              <h4>Required Skills:</h4>
              <div className="skill-tags">
                {currentOpportunity.requiredSkills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="skill-tag">{skill}</span>
                ))}
                {currentOpportunity.requiredSkills.length > 3 && (
                  <span className="skill-tag">+{currentOpportunity.requiredSkills.length - 3} more</span>
                )}
              </div>
            </div>
          </div>

          <div className="card-actions">
            <button 
              className="action-btn skip-btn"
              onClick={() => handleSwipe('left')}
            >
              <X size={28} />
            </button>
            <button 
              className="action-btn super-btn"
              onClick={() => handleSwipe('super')}
              disabled={superLikesLeft === 0}
            >
              <Star size={24} fill={superLikesLeft > 0 ? '#EEE82C' : '#ccc'} />
            </button>
            <button 
              className="action-btn like-btn"
              onClick={() => handleSwipe('right')}
            >
              <Heart size={28} />
            </button>
          </div>
        </div>
      </div>

      <div className="swipe-instructions">
        <p>
          <Heart size={16} /> Swipe right to express interest •
          <Star size={16} fill="#EEE82C" /> Super like to stand out •
          <X size={16} /> Skip to pass
        </p>
      </div>
    </div>
  );
};

export default SwipeDeck;

