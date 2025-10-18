import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Check, X, ExternalLink } from 'lucide-react';
import '../../styles/ApplicantDashboard.css';

const ApplicantDashboard = () => {
  const { currentUser } = useAuth();
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const ngo = useQuery(
    api.ngos.getNGOByUserId,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const pendingMatches = useQuery(
    api.matches.getPendingMatchesForNGO,
    ngo?._id ? { ngoId: ngo._id } : 'skip'
  );

  const respondToMatch = useMutation(api.matches.respondToMatch);

  const handleResponse = async (matchId, accept) => {
    try {
      await respondToMatch({ matchId, accept });
      setSelectedApplicant(null);
    } catch (error) {
      console.error('Error responding to match:', error);
    }
  };

  return (
    <div className="applicant-dashboard">
      <div className="page-header">
        <h1>Volunteer Applicants</h1>
        <p>Review and accept volunteers who have shown interest</p>
      </div>

      {!pendingMatches || pendingMatches.length === 0 ? (
        <div className="empty-state">
          <Users size={64} />
          <h2>No Pending Applications</h2>
          <p>When volunteers express interest in your opportunities, they'll appear here.</p>
        </div>
      ) : (
        <div className="applicants-grid">
          {pendingMatches.map((match) => (
            <div key={match._id} className="applicant-card">
              <div className="applicant-header">
                <img 
                  src={match.volunteer?.profilePicture || 'https://via.placeholder.com/80'}
                  alt={match.volunteer?.name}
                  className="applicant-avatar"
                />
                <div className="applicant-info">
                  <h3>{match.volunteer?.name}</h3>
                  <p className="applicant-email">{match.volunteer?.email}</p>
                </div>
              </div>

              <div className="applicant-opportunity">
                <strong>Applied for:</strong>
                <p>{match.opportunity?.title}</p>
              </div>

              {match.volunteer?.bio && (
                <div className="applicant-section">
                  <h4>About</h4>
                  <p>{match.volunteer.bio}</p>
                </div>
              )}

              {match.volunteer?.personalStatement && (
                <div className="applicant-section">
                  <h4>Why They Want to Volunteer</h4>
                  <p>{match.volunteer.personalStatement}</p>
                </div>
              )}

              <div className="applicant-section">
                <h4>Skills</h4>
                <div className="skill-list">
                  {[...(match.volunteer?.technicalSkills || []), ...(match.volunteer?.softSkills || [])].map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="applicant-section">
                <h4>Interests</h4>
                <div className="skill-list">
                  {(match.volunteer?.interests || []).map((interest, idx) => (
                    <span key={idx} className="interest-tag">{interest}</span>
                  ))}
                </div>
              </div>

              <div className="applicant-stats">
                <div className="stat-item">
                  <strong>{match.volunteer?.tasksCompleted || 0}</strong>
                  <span>Tasks Completed</span>
                </div>
                <div className="stat-item">
                  <strong>{match.volunteer?.totalHoursVolunteered || 0}h</strong>
                  <span>Hours Volunteered</span>
                </div>
              </div>

              {match.volunteer?.portfolioLink && (
                <a 
                  href={match.volunteer.portfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-link"
                >
                  <ExternalLink size={16} />
                  View Portfolio
                </a>
              )}

              <div className="applicant-actions">
                <button 
                  className="btn btn-danger"
                  onClick={() => handleResponse(match._id, false)}
                >
                  <X size={18} />
                  Decline
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => handleResponse(match._id, true)}
                >
                  <Check size={18} />
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicantDashboard;

