import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Clock, Check, X, Heart, MapPin, Briefcase } from 'lucide-react';
import '../../styles/Applied.css';

const Applied = () => {
  const { currentUser } = useAuth();

  const allMatches = useQuery(
    api.matches.getAllMatchesForVolunteer,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} />;
      case 'accepted':
        return <Check size={20} />;
      case 'rejected':
        return <X size={20} />;
      default:
        return <Heart size={20} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
      case 'active':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'accepted':
        return 'Accepted';
      case 'active':
        return 'Active';
      case 'rejected':
        return 'Declined';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <div className="applied-page">
      <div className="page-header">
        <div>
          <h1>My Applications</h1>
          <p>Track the status of your volunteer applications</p>
        </div>
      </div>

      {!allMatches || allMatches.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={64} />
          <h2>No Applications Yet</h2>
          <p>Apply to opportunities to see them here!</p>
        </div>
      ) : (
        <div className="applications-list">
          {allMatches.map((match) => (
            <div key={match._id} className={`application-card ${getStatusClass(match.status)}`}>
              <div className="application-header">
                <div className="app-org-info">
                  <img 
                    src={match.ngo?.logo || 'https://via.placeholder.com/60'}
                    alt={match.ngo?.organizationName}
                    className="app-org-logo"
                  />
                  <div>
                    <h3>{match.opportunity?.title}</h3>
                    <p className="app-org-name">{match.ngo?.organizationName}</p>
                  </div>
                </div>
                <div className={`status-badge-app ${getStatusClass(match.status)}`}>
                  {getStatusIcon(match.status)}
                  {getStatusText(match.status)}
                </div>
              </div>

              <p className="app-description">{match.opportunity?.description}</p>

              <div className="app-meta">
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{match.opportunity?.location}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{match.opportunity?.timeCommitment}</span>
                </div>
              </div>

              <div className="app-footer">
                <span className="app-date">
                  Applied {new Date(match.createdAt).toLocaleDateString()}
                </span>
                {match.status === 'accepted' && match.acceptedAt && (
                  <span className="app-date accepted-date">
                    Accepted {new Date(match.acceptedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applied;

