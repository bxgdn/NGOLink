import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { MessageCircle, Briefcase, CheckCircle } from 'lucide-react';
import '../../styles/Missions.css';

const MyMissions = () => {
  const { currentUser } = useAuth();
  
  const matches = useQuery(
    api.matches.getMatchesForVolunteer,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  if (!matches || matches.length === 0) {
    return (
      <div className="missions-page">
        <h1>My Missions</h1>
        <div className="empty-state">
          <Briefcase size={64} />
          <h2>No Active Missions</h2>
          <p>Start swiping to match with NGOs and begin your volunteer journey!</p>
          <Link to="/volunteer/swipe" className="btn btn-primary">
            Find Opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="missions-page">
      <div className="page-header">
        <h1>My Missions</h1>
        <p>Your active volunteer engagements</p>
      </div>

      <div className="missions-grid">
        {matches.map((match) => (
          <div key={match._id} className="mission-card">
            <div className="mission-image">
              <img 
                src={match.ngo?.coverImage || 'https://via.placeholder.com/400x200'}
                alt={match.opportunity?.title}
              />
              <span className={`status-badge ${match.status}`}>
                {match.status}
              </span>
            </div>

            <div className="mission-content">
              <div className="mission-header">
                <img 
                  src={match.ngo?.logo || 'https://via.placeholder.com/50'}
                  alt={match.ngo?.organizationName}
                  className="ngo-avatar"
                />
                <div>
                  <h3>{match.opportunity?.title}</h3>
                  <p className="ngo-name">{match.ngo?.organizationName}</p>
                </div>
              </div>

              <p className="mission-description">
                {match.opportunity?.description}
              </p>

              <div className="mission-meta">
                <div className="meta-item">
                  <CheckCircle size={16} />
                  <span>{match.opportunity?.timeCommitment}</span>
                </div>
                <div className="meta-item">
                  <Briefcase size={16} />
                  <span>{match.opportunity?.location}</span>
                </div>
              </div>

              <div className="mission-actions">
                <Link 
                  to={`/volunteer/chat/${match._id}`}
                  className="btn btn-primary btn-sm"
                >
                  <MessageCircle size={16} />
                  Chat
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyMissions;

