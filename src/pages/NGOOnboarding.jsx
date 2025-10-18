import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import '../styles/Onboarding.css';

const NGOOnboarding = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    mission: '',
    description: '',
    website: '',
  });

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const createNGO = useMutation(api.ngos.createNGO);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNGO({
        userId: currentUser.userId,
        ...formData,
      });
      navigate('/ngo/dashboard');
    } catch (error) {
      console.error('Error creating NGO profile:', error);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="step-content">
            <h2>Tell us about your organization</h2>
            <p className="step-subtitle">This information will be visible to potential volunteers</p>

            <div className="form-group">
              <label>Organization Name *</label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                required
                placeholder="Your NGO Name"
              />
            </div>

            <div className="form-group">
              <label>Mission Statement *</label>
              <textarea
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                required
                placeholder="What is your organization's mission?"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Tell volunteers about your organization, its history, and impact..."
                rows="5"
              />
            </div>

            <div className="form-group">
              <label>Website (Optional)</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourorganization.org"
              />
            </div>

            <div className="info-box">
              <strong>Note:</strong> Your organization will need to be verified before you can post opportunities. 
              We'll review your profile within 24-48 hours.
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block">
              Create Organization Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NGOOnboarding;

