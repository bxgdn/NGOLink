import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Edit2, Save, Camera } from 'lucide-react';
import '../../styles/Profile.css';

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

const Profile = () => {
  const { user, currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    personalStatement: user?.personalStatement || '',
    portfolioLink: user?.portfolioLink || '',
    technicalSkills: user?.technicalSkills || [],
    softSkills: user?.softSkills || [],
    interests: user?.interests || [],
    hoursPerWeek: user?.hoursPerWeek || 5,
    preferredLocation: user?.preferredLocation || 'remote',
  });

  const updateProfile = useMutation(api.users.updateVolunteerProfile);
  const updateProfilePicture = useMutation(api.users.updateProfilePicture);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      setUploadError('Image size must be less than 1MB');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await updateProfilePicture({
            userId: currentUser.userId,
            profilePicture: reader.result,
          });
          setUploading(false);
        } catch (error) {
          console.error('Error uploading image:', error);
          setUploadError('Failed to upload image');
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setUploadError('Failed to read file');
      setUploading(false);
    }
  };

  const toggleSkill = (category, skill) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(skill)
        ? prev[category].filter(s => s !== skill)
        : [...prev[category], skill]
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        userId: currentUser.userId,
        ...formData,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-upload-container">
            <img 
              src={user.profilePicture || 'https://via.placeholder.com/120'}
              alt={user.name}
              className="profile-avatar-large"
            />
            <button 
              className="avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Upload profile picture"
            >
              <Camera size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div>
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            {uploadError && <p className="upload-error">{uploadError}</p>}
            {uploading && <p className="upload-status">Uploading...</p>}
          </div>
        </div>
        <button 
          className="btn btn-outline"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? <><Save size={18} /> Save</> : <><Edit2 size={18} /> Edit Profile</>}
        </button>
      </div>

      <div className="profile-stats">
        <div className="stat-box">
          <h3>{user.tasksCompleted}</h3>
          <p>Tasks Completed</p>
        </div>
        <div className="stat-box">
          <h3>{user.totalHoursVolunteered}h</h3>
          <p>Hours Volunteered</p>
        </div>
        <div className="stat-box">
          <h3>{user.achievements?.length || 0}</h3>
          <p>Achievements</p>
        </div>
      </div>

      <div className="profile-content">
        <section className="profile-section">
          <h2>About Me</h2>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows="4"
            />
          ) : (
            <p>{user.bio || 'No bio yet'}</p>
          )}
        </section>

        <section className="profile-section">
          <h2>Why I Volunteer</h2>
          {isEditing ? (
            <textarea
              value={formData.personalStatement}
              onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
              placeholder="Share your motivation..."
              rows="4"
            />
          ) : (
            <p>{user.personalStatement || 'No statement yet'}</p>
          )}
        </section>

        {(user.portfolioLink || isEditing) && (
          <section className="profile-section">
            <h2>Portfolio</h2>
            {isEditing ? (
              <input
                type="url"
                value={formData.portfolioLink}
                onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                placeholder="https://yourportfolio.com"
              />
            ) : (
              <a href={user.portfolioLink} target="_blank" rel="noopener noreferrer">
                {user.portfolioLink}
              </a>
            )}
          </section>
        )}

        <section className="profile-section">
          <h2>Technical Skills</h2>
          <div className="skill-grid">
            {isEditing ? (
              TECHNICAL_SKILLS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`skill-tag ${formData.technicalSkills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill('technicalSkills', skill)}
                >
                  {skill}
                </button>
              ))
            ) : (
              user.technicalSkills.map((skill, idx) => (
                <span key={idx} className="skill-tag selected">{skill}</span>
              ))
            )}
          </div>
        </section>

        <section className="profile-section">
          <h2>Soft Skills</h2>
          <div className="skill-grid">
            {isEditing ? (
              SOFT_SKILLS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`skill-tag ${formData.softSkills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill('softSkills', skill)}
                >
                  {skill}
                </button>
              ))
            ) : (
              user.softSkills.map((skill, idx) => (
                <span key={idx} className="skill-tag selected">{skill}</span>
              ))
            )}
          </div>
        </section>

        <section className="profile-section">
          <h2>Interests & Causes</h2>
          <div className="skill-grid">
            {isEditing ? (
              CAUSES.map(cause => (
                <button
                  key={cause}
                  type="button"
                  className={`skill-tag ${formData.interests.includes(cause) ? 'selected' : ''}`}
                  onClick={() => toggleSkill('interests', cause)}
                >
                  {cause}
                </button>
              ))
            ) : (
              user.interests.map((interest, idx) => (
                <span key={idx} className="skill-tag selected">{interest}</span>
              ))
            )}
          </div>
        </section>

        <section className="profile-section">
          <h2>Availability</h2>
          {isEditing ? (
            <div>
              <label>Hours per week: {formData.hoursPerWeek}h</label>
              <input
                type="range"
                min="1"
                max="40"
                value={formData.hoursPerWeek}
                onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) })}
              />
              <div className="radio-group">
                {['remote', 'in-person', 'hybrid'].map(type => (
                  <label key={type} className="radio-label">
                    <input
                      type="radio"
                      value={type}
                      checked={formData.preferredLocation === type}
                      onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p><strong>Hours per week:</strong> {user.hoursPerWeek}h</p>
              <p><strong>Preferred location:</strong> {user.preferredLocation}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;

