import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import '../styles/Onboarding.css';

const TECHNICAL_SKILLS = [
  'Web Development', 'Graphic Design', 'Content Writing', 'Video Editing',
  'Social Media', 'Photography', 'Data Analysis', 'Marketing', 'Translation'
];

const SOFT_SKILLS = [
  'Public Speaking', 'Event Management', 'Mentoring', 'Teaching',
  'Leadership', 'Communication', 'Project Management', 'Fundraising'
];

const CAUSES = [
  'Environment', 'Animal Welfare', 'Education', 'Human Rights',
  'Healthcare', 'Poverty Alleviation', 'Children & Youth', 'Arts & Culture'
];

const VolunteerOnboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    bio: '',
    personalStatement: '',
    portfolioLink: '',
    technicalSkills: [],
    softSkills: [],
    interests: [],
    hoursPerWeek: 5,
    preferredLocation: 'remote',
  });

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useMutation(api.users.updateVolunteerProfile);

  const toggleSkill = (category, skill) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(skill)
        ? prev[category].filter(s => s !== skill)
        : [...prev[category], skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        await updateProfile({
          userId: currentUser.userId,
          ...formData,
        });
        navigate('/volunteer/dashboard');
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
          <p>Step {step} of 3</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {step === 1 && (
            <div className="step-content">
              <h2>Tell us about yourself</h2>
              <p className="step-subtitle">Help NGOs understand who you are</p>

              <div className="form-group">
                <label>Short Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself in a few sentences..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Why do you want to volunteer?</label>
                <textarea
                  value={formData.personalStatement}
                  onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
                  placeholder="Share your motivation and what causes you're passionate about..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Portfolio Link (Optional)</label>
                <input
                  type="url"
                  value={formData.portfolioLink}
                  onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h2>Select your skills & interests</h2>
              <p className="step-subtitle">Choose all that apply</p>

              <div className="skill-section">
                <h3>Technical Skills</h3>
                <div className="skill-grid">
                  {TECHNICAL_SKILLS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      className={`skill-tag ${formData.technicalSkills.includes(skill) ? 'selected' : ''}`}
                      onClick={() => toggleSkill('technicalSkills', skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="skill-section">
                <h3>Soft Skills</h3>
                <div className="skill-grid">
                  {SOFT_SKILLS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      className={`skill-tag ${formData.softSkills.includes(skill) ? 'selected' : ''}`}
                      onClick={() => toggleSkill('softSkills', skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="skill-section">
                <h3>Causes You Care About</h3>
                <div className="skill-grid">
                  {CAUSES.map(cause => (
                    <button
                      key={cause}
                      type="button"
                      className={`skill-tag ${formData.interests.includes(cause) ? 'selected' : ''}`}
                      onClick={() => toggleSkill('interests', cause)}
                    >
                      {cause}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h2>Your availability</h2>
              <p className="step-subtitle">Help us match you with the right opportunities</p>

              <div className="form-group">
                <label>Hours per week you can commit</label>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={formData.hoursPerWeek}
                  onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) })}
                />
                <div className="range-value">{formData.hoursPerWeek} hours/week</div>
              </div>

              <div className="form-group">
                <label>Preferred Location Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="location"
                      value="remote"
                      checked={formData.preferredLocation === 'remote'}
                      onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                    />
                    <span>Remote</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="location"
                      value="in-person"
                      checked={formData.preferredLocation === 'in-person'}
                      onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                    />
                    <span>In-Person</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="location"
                      value="hybrid"
                      checked={formData.preferredLocation === 'hybrid'}
                      onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                    />
                    <span>Hybrid</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {step === 3 ? 'Complete' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerOnboarding;

