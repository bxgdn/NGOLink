import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Users, Briefcase, CheckSquare, TrendingUp, Clock } from 'lucide-react';
import '../../styles/Dashboard.css';

const NGODashboard = () => {
  const { currentUser } = useAuth();
  
  const ngo = useQuery(
    api.ngos.getNGOByUserId,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const stats = useQuery(
    api.ngos.getNGOStats,
    ngo?._id ? { ngoId: ngo._id } : 'skip'
  );

  const pendingMatches = useQuery(
    api.matches.getPendingMatchesForNGO,
    ngo?._id ? { ngoId: ngo._id } : 'skip'
  );

  const tasks = useQuery(
    api.tasks.getTasksForNGO,
    ngo?._id ? { ngoId: ngo._id } : 'skip'
  );

  const pendingReview = tasks?.filter(t => t.status === 'submitted') || [];

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div>
          <h1>Welcome, {ngo?.organizationName}! 👋</h1>
          <p>{ngo?.isVerified ? '✅ Verified Organization' : '⏳ Pending Verification'}</p>
        </div>
        <Link to="/ngo/opportunities" className="btn btn-primary">
          <Briefcase size={18} />
          Manage Opportunities
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#91CB3E' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.activeVolunteers || 0}</h3>
            <p>Active Volunteers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#53A548' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.totalOpportunities || 0}</h3>
            <p>Opportunities</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EEE82C' }}>
            <CheckSquare size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.completedTasks || 0}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#4C934C' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.totalHours || 0}h</h3>
            <p>Volunteer Hours</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="section-card">
            <div className="section-header">
              <h2>Pending Applicants</h2>
              <Link to="/ngo/applicants" className="link">View All</Link>
            </div>
            {!pendingMatches || pendingMatches.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <p>No pending applications</p>
              </div>
            ) : (
              <div className="applicant-list">
                {pendingMatches.slice(0, 3).map(match => (
                  <div key={match._id} className="applicant-item">
                    <img 
                      src={match.volunteer?.profilePicture || 'https://via.placeholder.com/40'}
                      alt={match.volunteer?.name}
                      className="applicant-avatar"
                    />
                    <div className="applicant-info">
                      <h4>{match.volunteer?.name}</h4>
                      <p>{match.opportunity?.title}</p>
                    </div>
                    <Link to="/ngo/applicants" className="btn btn-sm btn-outline">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2>Tasks Pending Review</h2>
              <Link to="/ngo/tasks" className="link">View All</Link>
            </div>
            {pendingReview.length === 0 ? (
              <div className="empty-state">
                <CheckSquare size={48} />
                <p>No tasks pending review</p>
              </div>
            ) : (
              <div className="task-list">
                {pendingReview.slice(0, 3).map(task => (
                  <div key={task._id} className="task-item">
                    <div className="task-info">
                      <h4>{task.title}</h4>
                      <p className="task-org">By {task.volunteer?.name}</p>
                    </div>
                    <span className="status-badge submitted">Submitted</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="section-card highlight-card">
            <h3>🎯 Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/ngo/opportunities" className="quick-action-btn">
                <Briefcase size={20} />
                <span>Create Opportunity</span>
              </Link>
              <Link to="/ngo/tasks" className="quick-action-btn">
                <CheckSquare size={20} />
                <span>Create Task</span>
              </Link>
              <Link to="/ngo/profile" className="quick-action-btn">
                <TrendingUp size={20} />
                <span>Update Profile</span>
              </Link>
            </div>
          </div>

          {!ngo?.isVerified && (
            <div className="section-card warning-card">
              <h3>⏳ Verification Pending</h3>
              <p>Your organization is under review. You'll be able to post opportunities once verified.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;

