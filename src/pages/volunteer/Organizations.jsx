import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import { Search, MapPin, ExternalLink, Heart, Briefcase } from 'lucide-react';
import '../../styles/Organizations.css';

const Organizations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNGO, setSelectedNGO] = useState(null);
  const navigate = useNavigate();
  
  const allNGOs = useQuery(api.ngos.getVerifiedNGOs);
  
  const ngoOpportunities = useQuery(
    api.opportunities.getOpportunitiesByNGO,
    selectedNGO ? { ngoId: selectedNGO } : 'skip'
  );

  const handleViewOpportunities = async (ngoId) => {
    setSelectedNGO(ngoId);
  };

  const filteredNGOs = useMemo(() => {
    if (!allNGOs) return [];
    
    if (!searchQuery) return allNGOs;
    
    const query = searchQuery.toLowerCase();
    return allNGOs.filter(ngo => 
      ngo.organizationName.toLowerCase().includes(query) ||
      ngo.mission.toLowerCase().includes(query) ||
      ngo.description.toLowerCase().includes(query)
    );
  }, [allNGOs, searchQuery]);

  return (
    <div className="organizations-page">
      {selectedNGO && ngoOpportunities && (
        <div className="modal-overlay" onClick={() => setSelectedNGO(null)}>
          <div className="modal-content opportunities-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Opportunities</h2>
              <button className="close-btn" onClick={() => setSelectedNGO(null)}>×</button>
            </div>
            <div className="opportunities-list-modal">
              {ngoOpportunities.length === 0 ? (
                <div className="empty-state-modal">
                  <Briefcase size={48} />
                  <p>No active opportunities at the moment</p>
                </div>
              ) : (
                ngoOpportunities.filter(opp => opp.isActive).map(opp => (
                  <div key={opp._id} className="opportunity-modal-card">
                    <h3>{opp.title}</h3>
                    <p className="opp-description">{opp.description}</p>
                    <div className="opp-meta">
                      <span><MapPin size={14} /> {opp.location}</span>
                      <span>• {opp.timeCommitment}</span>
                    </div>
                    <div className="opp-skills">
                      {opp.requiredSkills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-tag-small">{skill}</span>
                      ))}
                      {opp.requiredSkills.length > 3 && (
                        <span className="skill-tag-small">+{opp.requiredSkills.length - 3}</span>
                      )}
                    </div>
                    <button 
                      className="btn btn-primary btn-sm btn-block"
                      onClick={() => {
                        setSelectedNGO(null);
                        navigate('/volunteer/swipe');
                      }}
                    >
                      <Heart size={14} />
                      Apply via Swipe Deck
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="page-header">
        <div>
          <h1>Discover Organizations</h1>
          <p>Find NGOs and volunteer organizations making a difference</p>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box-large">
          <Search size={24} />
          <input
            type="text"
            placeholder="Search organizations by name, mission, or cause..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="search-results-count">
          {filteredNGOs.length} organization{filteredNGOs.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="organizations-grid">
        {!filteredNGOs || filteredNGOs.length === 0 ? (
          <div className="empty-state">
            <Search size={64} />
            <h2>No Organizations Found</h2>
            <p>Try adjusting your search query</p>
          </div>
        ) : (
          filteredNGOs.map(ngo => (
            <div key={ngo._id} className="organization-card">
              <div className="org-card-header">
                <img 
                  src={ngo.logo || 'https://via.placeholder.com/80'}
                  alt={ngo.organizationName}
                  className="org-logo"
                />
                <div className="org-header-content">
                  <h3>{ngo.organizationName}</h3>
                  <span className="verified-badge">✅ Verified</span>
                </div>
              </div>

              <div className="org-card-body">
                <div className="org-mission">
                  <h4>Mission</h4>
                  <p>{ngo.mission}</p>
                </div>

                {ngo.description && (
                  <div className="org-description">
                    <h4>About</h4>
                    <p>{ngo.description}</p>
                  </div>
                )}

                <div className="org-stats">
                  <div className="org-stat">
                    <Heart size={16} />
                    <span>{ngo.totalVolunteers || 0} volunteers</span>
                  </div>
                  <div className="org-stat">
                    <MapPin size={16} />
                    <span>{ngo.totalHoursReceived || 0}h contributed</span>
                  </div>
                </div>
              </div>

              <div className="org-card-footer">
                {ngo.website && (
                  <a 
                    href={ngo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    <ExternalLink size={16} />
                    Visit Website
                  </a>
                )}
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleViewOpportunities(ngo._id)}
                >
                  <Briefcase size={16} />
                  View Opportunities
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Organizations;

