import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Filter, Search, Camera, X } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // all, active, inactive
    cause: [],
    skill: [],
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    timeCommitment: '',
    location: '',
    locationType: 'remote',
    cause: [],
    coverImage: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (1MB limit)
    if (file.size > 1024 * 1024) {
      setUploadError('Image must be less than 1MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('File must be an image');
      return;
    }

    setUploadingImage(true);
    setUploadError('');

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, coverImage: reader.result });
        setUploadingImage(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read image');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, coverImage: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        coverImage: '',
      });
      
      // Clear all filters and search to show the newly created opportunity
      setFilters({
        status: 'all',
        cause: [],
        skill: [],
      });
      setSearchQuery('');
      setShowFilters(false);
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleEdit = (opportunity) => {
    setEditingId(opportunity._id);
    setFormData({
      title: opportunity.title || '',
      description: opportunity.description || '',
      requiredSkills: opportunity.requiredSkills || [],
      timeCommitment: opportunity.timeCommitment || '',
      location: opportunity.location || '',
      locationType: opportunity.locationType || 'remote',
      cause: opportunity.cause || [],
      coverImage: opportunity.coverImage || '',
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

  const toggleFilterArray = (filterType, value) => {
    setFilters(prev => {
      const current = prev[filterType];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterType]: newValue };
    });
  };

  const clearFilters = () => {
    setFilters({ status: 'all', cause: [], skill: [] });
    setSearchQuery('');
  };

  // Filter opportunities based on search and filters
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    
    let filtered = opportunities;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(opp => 
        filters.status === 'active' ? opp.isActive : !opp.isActive
      );
    }

    // Cause filter
    if (filters.cause.length > 0) {
      filtered = filtered.filter(opp =>
        opp.cause.some(c => filters.cause.includes(c))
      );
    }

    // Skill filter
    if (filters.skill.length > 0) {
      filtered = filtered.filter(opp =>
        opp.requiredSkills.some(s => filters.skill.includes(s))
      );
    }

    return filtered;
  }, [opportunities, searchQuery, filters]);

  const hasActiveFilters = filters.status !== 'all' || filters.cause.length > 0 || filters.skill.length > 0 || searchQuery;

  // Debug logging
  React.useEffect(() => {
    if (opportunities) {
      console.log('Total opportunities from DB:', opportunities.length);
      console.log('Filtered opportunities:', filteredOpportunities.length);
      console.log('Current filters:', filters);
      console.log('Search query:', searchQuery);
    }
  }, [opportunities, filteredOpportunities, filters, searchQuery]);

  return (
    <div className="opportunity-manager">
      <div className="page-header">
        <div>
          <h1>Opportunities</h1>
          <p>
            Manage your volunteer opportunities 
            {opportunities && ` (${filteredOpportunities.length} of ${opportunities.length} shown)`}
          </p>
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

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select 
            className="status-filter"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button 
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && <span className="filter-count">{
              filters.cause.length + filters.skill.length
            }</span>}
          </button>

          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel-opportunities">
          <div className="filter-section">
            <h4>Filter by Cause</h4>
            <div className="filter-chips">
              {CAUSES.map(cause => (
                <button
                  key={cause}
                  className={`filter-chip ${filters.cause.includes(cause) ? 'selected' : ''}`}
                  onClick={() => toggleFilterArray('cause', cause)}
                >
                  {cause}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Filter by Skills</h4>
            <div className="filter-chips">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  className={`filter-chip ${filters.skill.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleFilterArray('skill', skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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

              <div className="form-group">
                <label>Cover Image (optional)</label>
                <p className="form-hint">Upload an image for this opportunity (max 1MB)</p>
                
                {formData.coverImage ? (
                  <div className="image-preview-container">
                    <img 
                      src={formData.coverImage} 
                      alt="Cover preview" 
                      className="image-preview"
                    />
                    <button 
                      type="button"
                      className="remove-image-btn"
                      onClick={handleRemoveImage}
                    >
                      <X size={16} />
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-area">
                    <button
                      type="button"
                      className="upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Camera size={20} />
                      {uploadingImage ? 'Uploading...' : 'Upload Cover Image'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
                
                {uploadError && <p className="error-text">{uploadError}</p>}
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
        ) : filteredOpportunities.length === 0 ? (
          <div className="empty-state">
            <Filter size={64} />
            <h2>No Matching Opportunities</h2>
            <p>Try adjusting your filters or search query</p>
            <button className="btn btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          filteredOpportunities.map(opp => (
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

