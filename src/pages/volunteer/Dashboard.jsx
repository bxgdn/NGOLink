import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Heart, CheckSquare, Award, TrendingUp, Clock } from 'lucide-react';
import '../../styles/Dashboard.css';

const VolunteerDashboard = () => {
  const { currentUser, user } = useAuth();
  
  // Query user data directly for real-time stats updates
  const userData = useQuery(
    api.users.getUser,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const matches = useQuery(
    api.matches.getMatchesForVolunteer,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const tasks = useQuery(
    api.tasks.getTasksForVolunteer,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const achievements = useQuery(
    api.achievements.getUserAchievements,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const activeTasks = tasks?.filter(t => t.status === 'claimed' || t.status === 'in_progress') || [];
  const pendingReview = tasks?.filter(t => t.status === 'submitted') || [];
  
  // Use userData for stats, fallback to user from AuthContext
  const displayUser = userData || user;

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div>
          <h1>Welcome back, {displayUser?.name}! 👋</h1>
          <p>Ready to make a difference today?</p>
        </div>
        <Link to="/volunteer/swipe" className="btn btn-primary">
          <Heart size={18} />
          Find Opportunities
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#91CB3E' }}>
            <CheckSquare size={24} />
          </div>
          <div className="stat-content">
            <h3>{displayUser?.tasksCompleted || 0}</h3>
            <p>Tasks Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#53A548' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{displayUser?.totalHoursVolunteered || 0}h</h3>
            <p>Hours Volunteered</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EEE82C' }}>
            <Award size={24} />
          </div>
          <div className="stat-content">
            <h3>{achievements?.length || 0}</h3>
            <p>Achievements</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#4C934C' }}>
            <Heart size={24} />
          </div>
          <div className="stat-content">
            <h3>{matches?.length || 0}</h3>
            <p>Active Matches</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="section-card">
            <div className="section-header">
              <h2>Active Tasks</h2>
              <Link to="/volunteer/tasks" className="link">View All</Link>
            </div>
            {activeTasks.length === 0 ? (
              <div className="empty-state">
                <CheckSquare size={48} />
                <p>No active tasks yet</p>
                <Link to="/volunteer/tasks" className="btn btn-outline">Browse Task Board</Link>
              </div>
            ) : (
              <div className="task-list">
                {activeTasks.slice(0, 3).map(task => (
                  <div key={task._id} className="task-item">
                    <div className="task-info">
                      <h4>{task.title}</h4>
                      <p className="task-org">{task.ngo?.name}</p>
                    </div>
                    <span className={`status-badge ${task.status}`}>{task.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2>My Missions</h2>
              <Link to="/volunteer/missions" className="link">View All</Link>
            </div>
            {!matches || matches.length === 0 ? (
              <div className="empty-state">
                <Heart size={48} />
                <p>No active missions</p>
                <Link to="/volunteer/swipe" className="btn btn-primary">Find Opportunities</Link>
              </div>
            ) : (
              <div className="mission-list">
                {matches.slice(0, 3).map(match => (
                  <div key={match._id} className="mission-card">
                    <div className="mission-header">
                      <img 
                        src={match.ngo?.logo || 'https://via.placeholder.com/50'} 
                        alt={match.ngo?.organizationName}
                        className="mission-logo"
                      />
                      <div>
                        <h4>{match.opportunity?.title}</h4>
                        <p>{match.ngo?.organizationName}</p>
                      </div>
                    </div>
                    <Link to={`/volunteer/chat/${match._id}`} className="btn btn-sm btn-outline">
                      Chat
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="section-card">
            <h3>Recent Achievements</h3>
            {!achievements || achievements.length === 0 ? (
              <p className="muted">Complete tasks to earn achievements!</p>
            ) : (
              <div className="achievement-list">
                {achievements.slice(0, 3).map(ua => (
                  <div key={ua._id} className="achievement-item">
                    <span className="achievement-icon">{ua.achievement?.icon}</span>
                    <div>
                      <h5>{ua.achievement?.name}</h5>
                      <p className="muted small">{ua.achievement?.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/volunteer/achievements" className="btn btn-outline btn-block mt-2">
              View All Achievements
            </Link>
          </div>

          <div className="section-card highlight-card">
            <h3>🎯 Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/volunteer/swipe" className="quick-action-btn">
                <Heart size={20} />
                <span>Find Opportunities</span>
              </Link>
              <Link to="/volunteer/tasks" className="quick-action-btn">
                <CheckSquare size={20} />
                <span>Browse Tasks</span>
              </Link>
              <Link to="/volunteer/profile" className="quick-action-btn">
                <TrendingUp size={20} />
                <span>Update Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;

