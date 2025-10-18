import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import '../../styles/OpportunityManager.css';

const CAUSES = [
  'Environment', 'Animal Welfare', 'Education', 'Human Rights',
  'Healthcare', 'Poverty Alleviation', 'Children & Youth', 'Arts & Culture'
];

const SKILLS = [
  'Web Development', 'Graphic Design', 'Content Writing', 'Video Editing',
  'Social Media', 'Photography', 'Event Management', 'Marketing', 'Teaching'
];

const OpportunityManager = () => {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    timeCommitment: '',
    location: '',
    locationType: 'remote',
    cause: [],
  });

  const ngo = useQuery(
    api.ngos.getNGOByUserId,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const opportunities = useQuery(
    api.opportunities.getOpportunitiesByNGO,
    ngo?._id ? { ngoId: ngo._id } : 'skip'
  );

  const createOpportunity = useMutation(api.opportunities.createOpportunity);
  const updateOpportunity = useMutation(api.opportunities.updateOpportunity);
  const deleteOpportunity = useMutation(api.opportunities.deleteOpportunity);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ngo?._id) return;

    try {
      if (editingId) {
        await updateOpportunity({
          opportunityId: editingId,
          ...formData,
        });
      } else {
        await createOpportunity({
          ngoId: ngo._id,
          ...formData,
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        requiredSkills: [],
        timeCommitment: '',
        location: '',
        locationType: 'remote',
        cause: [],
      });
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleEdit = (opportunity) => {
    setEditingId(opportunity._id);
    setFormData({
      title: opportunity.title,
      description: opportunity.description,
      requiredSkills: opportunity.requiredSkills,
      timeCommitment: opportunity.timeCommitment,
      location: opportunity.location,
      locationType: opportunity.locationType,
      cause: opportunity.cause,
    });
    setShowForm(true);
  };

  const handleDelete = async (opportunityId) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      await deleteOpportunity({ opportunityId });
    }
  };

  const toggleArray = (array, item) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const toggleActive = async (opportunity) => {
    await updateOpportunity({
      opportunityId: opportunity._id,
      isActive: !opportunity.isActive,
    });
  };

  if (!ngo?.isVerified) {
    return (
      <div className="opportunity-manager">
        <div className="verification-message">
          <h2>⏳ Organization Under Review</h2>
          <p>Your organization needs to be verified before you can create opportunities. We'll notify you once the review is complete.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="opportunity-manager">
      <div className="page-header">
        <div>
          <h1>Opportunities</h1>
          <p>Manage your volunteer opportunities</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              requiredSkills: [],
              timeCommitment: '',
              location: '',
              locationType: 'remote',
              cause: [],
            });
          }}
        >
          <Plus size={18} />
          Create Opportunity
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit' : 'Create'} Opportunity</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Design a Flyer for Charity Gala"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="4"
                  placeholder="Describe the opportunity..."
                />
              </div>

              <div className="form-group">
                <label>Required Skills *</label>
                <div className="checkbox-grid">
                  {SKILLS.map(skill => (
                    <label key={skill} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.requiredSkills.includes(skill)}
                        onChange={() => setFormData({
                          ...formData,
                          requiredSkills: toggleArray(formData.requiredSkills, skill)
                        })}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Causes *</label>
                <div className="checkbox-grid">
                  {CAUSES.map(cause => (
                    <label key={cause} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.cause.includes(cause)}
                        onChange={() => setFormData({
                          ...formData,
                          cause: toggleArray(formData.cause, cause)
                        })}
                      />
                      <span>{cause}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Time Commitment *</label>
                  <input
                    type="text"
                    value={formData.timeCommitment}
                    onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
                    required
                    placeholder="e.g., 5 hours/week"
                  />
                </div>

                <div className="form-group">
                  <label>Location Type *</label>
                  <select
                    value={formData.locationType}
                    onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                    required
                  >
                    <option value="remote">Remote</option>
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="e.g., Remote or New York, NY"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Create'} Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="opportunities-list">
        {!opportunities || opportunities.length === 0 ? (
          <div className="empty-state">
            <Plus size={64} />
            <h2>No Opportunities Yet</h2>
            <p>Create your first opportunity to start matching with volunteers!</p>
          </div>
        ) : (
          opportunities.map(opp => (
            <div key={opp._id} className="opportunity-card">
              <div className="opportunity-header">
                <div>
                  <h3>{opp.title}</h3>
                  <div className="opportunity-meta">
                    <span>{opp.location}</span>
                    <span>•</span>
                    <span>{opp.timeCommitment}</span>
                  </div>
                </div>
                <div className="opportunity-actions">
                  <button
                    className="icon-btn"
                    onClick={() => toggleActive(opp)}
                    title={opp.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {opp.isActive ? <ToggleRight size={24} color="#53A548" /> : <ToggleLeft size={24} />}
                  </button>
                  <button className="icon-btn" onClick={() => handleEdit(opp)}>
                    <Edit2 size={18} />
                  </button>
                  <button className="icon-btn" onClick={() => handleDelete(opp._id)}>
                    <Trash2 size={18} color="#dc3545" />
                  </button>
                </div>
              </div>

              <p className="opportunity-description">{opp.description}</p>

              <div className="opportunity-skills">
                {opp.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">{skill}</span>
                ))}
              </div>

              <div className="opportunity-footer">
                <span className={`status-badge ${opp.isActive ? 'active' : 'inactive'}`}>
                  {opp.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OpportunityManager;

