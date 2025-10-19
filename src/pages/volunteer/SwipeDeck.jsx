import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Heart, X, Star, MapPin, Clock, Filter } from 'lucide-react';
import '../../styles/SwipeDeck.css';

const CAUSES = [
  'Environment', 'Animal Welfare', 'Education', 'Human Rights',
  'Healthcare', 'Poverty Alleviation', 'Children & Youth', 'Arts & Culture'
];

const SKILLS = [
  'Web Development', 'Graphic Design', 'Content Writing', 'Video Editing',
  'Social Media', 'Photography', 'Data Analysis', 'Marketing', 'Translation',
  'Public Speaking', 'Event Management', 'Mentoring', 'Teaching'
];

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

  const toggleFilter = (filterType, value) => {
    setFilters(prev => {
      const currentFilters = prev[filterType];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(v => v !== value)
        : [...currentFilters, value];
      return { ...prev, [filterType]: newFilters };
    });
    setCurrentIndex(0); // Reset to first card when filters change
  };

  const clearFilters = () => {
    setFilters({ causeFilter: [], skillFilter: [] });
    setCurrentIndex(0);
  };

  const handleSwipe = async (direction) => {
    if (!currentOpportunity) return;

    try {
      if (direction === 'right') {
        // Heart button - Apply immediately
        await swipeOpportunity({
          userId: currentUser.userId,
          opportunityId: currentOpportunity._id,
          swipeType: 'right',
        });
      } else if (direction === 'super' && superLikesLeft > 0) {
        // Star button - Save for later (doesn't create match)
        await swipeOpportunity({
          userId: currentUser.userId,
          opportunityId: currentOpportunity._id,
          swipeType: 'super',
        });
        setSuperLikesLeft(prev => prev - 1);
      } else if (direction === 'left') {
        // Skip
        await swipeOpportunity({
          userId: currentUser.userId,
          opportunityId: currentOpportunity._id,
          swipeType: 'left',
        });
      }

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
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            {(filters.causeFilter.length > 0 || filters.skillFilter.length > 0) && (
              <span className="filter-badge">{filters.causeFilter.length + filters.skillFilter.length}</span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-section">
            <div className="filter-header">
              <h3>Filter by Cause</h3>
              {filters.causeFilter.length > 0 && (
                <button className="clear-btn" onClick={clearFilters}>Clear All</button>
              )}
            </div>
            <div className="filter-options">
              {CAUSES.map(cause => (
                <button
                  key={cause}
                  className={`filter-chip ${filters.causeFilter.includes(cause) ? 'selected' : ''}`}
                  onClick={() => toggleFilter('causeFilter', cause)}
                >
                  {cause}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Filter by Skills</h3>
            <div className="filter-options">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  className={`filter-chip ${filters.skillFilter.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleFilter('skillFilter', skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card-container">
        {/* Show next card in background */}
        {opportunities[currentIndex + 1] && (
          <div className="opportunity-card background-card">
            <div className="card-image">
              <img 
                src={opportunities[currentIndex + 1].coverImage || 'https://via.placeholder.com/600x300?text=Volunteer+Opportunity'}
                alt={opportunities[currentIndex + 1].title}
              />
            </div>
          </div>
        )}

        {/* Current card */}
        <div className="opportunity-card active-card">
          <div className="card-image">
            <img 
              src={currentOpportunity.coverImage || 'https://via.placeholder.com/600x300?text=Volunteer+Opportunity'}
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
          <Heart size={16} /> Apply now •
          <Star size={16} fill="#EEE82C" /> Save for later •
          <X size={16} /> Skip
        </p>
      </div>
    </div>
  );
};

export default SwipeDeck;

