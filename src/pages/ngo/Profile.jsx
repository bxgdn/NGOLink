import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Edit2, Save } from 'lucide-react';
import '../../styles/Profile.css';

const NGOProfile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const ngo = useQuery(
    api.ngos.getNGOByUserId,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const [formData, setFormData] = useState({
    organizationName: ngo?.organizationName || '',
    mission: ngo?.mission || '',
    vision: ngo?.vision || '',
    description: ngo?.description || '',
    website: ngo?.website || '',
  });

  const updateNGO = useMutation(api.ngos.updateNGO);

  const handleSave = async () => {
    if (!ngo?._id) return;
    
    try {
      await updateNGO({
        ngoId: ngo._id,
        ...formData,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating NGO profile:', error);
    }
  };

  if (!ngo) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <img 
            src={ngo.logo || 'https://via.placeholder.com/120'}
            alt={ngo.organizationName}
            className="profile-avatar-large"
          />
          <div>
            <h1>{ngo.organizationName}</h1>
            <p className="verification-status">
              {ngo.isVerified ? '✅ Verified Organization' : '⏳ Pending Verification'}
            </p>
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
          <h3>{ngo.totalVolunteers}</h3>
          <p>Total Volunteers</p>
        </div>
        <div className="stat-box">
          <h3>{ngo.totalHoursReceived}h</h3>
          <p>Volunteer Hours</p>
        </div>
      </div>

      <div className="profile-content">
        <section className="profile-section">
          <h2>Organization Name</h2>
          {isEditing ? (
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
            />
          ) : (
            <p>{ngo.organizationName}</p>
          )}
        </section>

        <section className="profile-section">
          <h2>Mission Statement</h2>
          {isEditing ? (
            <textarea
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              rows="3"
            />
          ) : (
            <p>{ngo.mission}</p>
          )}
        </section>

        <section className="profile-section">
          <h2>Vision</h2>
          {isEditing ? (
            <textarea
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
              rows="3"
            />
          ) : (
            <p>{ngo.vision || 'No vision statement yet'}</p>
          )}
        </section>

        <section className="profile-section">
          <h2>Description</h2>
          {isEditing ? (
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="5"
            />
          ) : (
            <p>{ngo.description}</p>
          )}
        </section>

        <section className="profile-section">
          <h2>Website</h2>
          {isEditing ? (
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://yourorganization.org"
            />
          ) : (
            <a href={ngo.website} target="_blank" rel="noopener noreferrer">
              {ngo.website || 'No website provided'}
            </a>
          )}
        </section>
      </div>
    </div>
  );
};

export default NGOProfile;

