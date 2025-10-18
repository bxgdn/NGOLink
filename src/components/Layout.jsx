import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  Home, 
  Heart, 
  CheckSquare, 
  Award, 
  User, 
  MessageCircle,
  LogOut,
  Bell,
  Briefcase,
  Users
} from 'lucide-react';
import '../styles/Layout.css';

const Layout = () => {
  const { currentUser, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const notifications = useQuery(
    api.notifications.getUnreadCount,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isVolunteer = currentUser?.userType === 'volunteer';
  const isNGO = currentUser?.userType === 'ngo';

  const volunteerNav = [
    { path: '/volunteer/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/volunteer/swipe', icon: Heart, label: 'Opportunities' },
    { path: '/volunteer/missions', icon: Briefcase, label: 'My Missions' },
    { path: '/volunteer/tasks', icon: CheckSquare, label: 'Task Board' },
    { path: '/volunteer/achievements', icon: Award, label: 'Achievements' },
    { path: '/volunteer/profile', icon: User, label: 'Profile' },
  ];

  const ngoNav = [
    { path: '/ngo/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/ngo/opportunities', icon: Briefcase, label: 'Opportunities' },
    { path: '/ngo/applicants', icon: Users, label: 'Applicants' },
    { path: '/ngo/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/ngo/profile', icon: User, label: 'Profile' },
  ];

  const navItems = isVolunteer ? volunteerNav : ngoNav;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">🌱 VolunteerConnect</h1>
        </div>
        
        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-container">
        <header className="header">
          <div className="header-content">
            <h2 className="page-title">Welcome, {user?.name || currentUser?.name}!</h2>
            <div className="header-actions">
              <button className="icon-btn">
                <Bell size={20} />
                {notifications > 0 && <span className="badge">{notifications}</span>}
              </button>
              <div className="user-menu">
                <img 
                  src={user?.profilePicture || 'https://via.placeholder.com/40'} 
                  alt="Profile" 
                  className="user-avatar"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

