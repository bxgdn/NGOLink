import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
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
  Users,
  X,
  Building2,
  Star,
  FileText
} from 'lucide-react';
import '../styles/Layout.css';

const Layout = () => {
  const { currentUser, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  
  const isVolunteer = currentUser?.userType === 'volunteer';
  const isNGO = currentUser?.userType === 'ngo';

  // Get NGO data for NGO users
  const ngo = useQuery(
    api.ngos.getNGOByUserId,
    isNGO && currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );
  
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const allNotifications = useQuery(
    api.notifications.getNotifications,
    currentUser?.userId ? { userId: currentUser.userId, limit: 20 } : 'skip'
  );

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  // Get the profile image based on user type
  const profileImage = isNGO 
    ? (ngo?.logo || 'https://via.placeholder.com/40')
    : (user?.profilePicture || 'https://via.placeholder.com/40');

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead({ notificationId: notification._id });
    }
    setShowNotifications(false);
    
    // Navigate based on notification type
    const basePath = isVolunteer ? '/volunteer' : '/ngo';
    
    switch (notification.type) {
      case 'new_applicant':
        navigate('/ngo/applicants');
        break;
      case 'match_accepted':
        navigate('/volunteer/missions');
        break;
      case 'task_assigned':
        navigate('/volunteer/tasks');
        break;
      case 'task_submitted':
        navigate('/ngo/task-review');
        break;
      case 'task_completed':
        navigate('/volunteer/tasks');
        break;
      case 'new_message':
        navigate(`${basePath}/messages`);
        break;
      default:
        // For other types, navigate to dashboard
        navigate(`${basePath}/dashboard`);
    }
  };

  const handleMarkAllRead = async () => {
    if (currentUser?.userId) {
      await markAllAsRead({ userId: currentUser.userId });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatNotificationTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const volunteerNav = [
    { path: '/volunteer/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/volunteer/swipe', icon: Heart, label: 'Opportunities' },
    { path: '/volunteer/saved', icon: Star, label: 'Saved' },
    { path: '/volunteer/applied', icon: FileText, label: 'Applied' },
    { path: '/volunteer/organizations', icon: Building2, label: 'Organizations' },
    { path: '/volunteer/missions', icon: Briefcase, label: 'My Missions' },
    { path: '/volunteer/tasks', icon: CheckSquare, label: 'Task Board' },
    { path: '/volunteer/achievements', icon: Award, label: 'Achievements' },
    { path: '/volunteer/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/volunteer/profile', icon: User, label: 'Profile' },
  ];

  const ngoNav = [
    { path: '/ngo/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/ngo/opportunities', icon: Briefcase, label: 'Opportunities' },
    { path: '/ngo/applicants', icon: Users, label: 'Applicants' },
    { path: '/ngo/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/ngo/task-review', icon: FileText, label: 'Task Review' },
    { path: '/ngo/award-medals', icon: Award, label: 'Award Medals' },
    { path: '/ngo/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/ngo/profile', icon: User, label: 'Profile' },
  ];

  const navItems = isVolunteer ? volunteerNav : ngoNav;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">🌱 NGOLink</h1>
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
              <div className="notifications-container" ref={notificationsRef}>
                <button 
                  className="icon-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </button>

                {showNotifications && (
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          className="mark-all-read"
                          onClick={handleMarkAllRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="notifications-list">
                      {!allNotifications || allNotifications.length === 0 ? (
                        <div className="no-notifications">
                          <Bell size={48} />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        allNotifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="notification-content">
                              <h4>{notification.title}</h4>
                              <p>{notification.message}</p>
                              <span className="notification-time">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                            {!notification.isRead && <div className="unread-indicator" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link to={isVolunteer ? '/volunteer/profile' : '/ngo/profile'} className="user-menu">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="user-avatar"
                />
              </Link>
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

