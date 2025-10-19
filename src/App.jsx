import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VolunteerOnboarding from './pages/VolunteerOnboarding';
import NGOOnboarding from './pages/NGOOnboarding';

// Volunteer Pages
import VolunteerDashboard from './pages/volunteer/Dashboard';
import SwipeDeck from './pages/volunteer/SwipeDeck';
import MyMissions from './pages/volunteer/MyMissions';
import TaskBoard from './pages/volunteer/TaskBoard';
import Profile from './pages/volunteer/Profile';
import Achievements from './pages/volunteer/Achievements';
import Chat from './pages/volunteer/Chat';
import Organizations from './pages/volunteer/Organizations';
import SavedOpportunities from './pages/volunteer/SavedOpportunities';
import Applied from './pages/volunteer/Applied';

// Shared Pages
import Messages from './pages/Messages';

// NGO Pages
import NGODashboard from './pages/ngo/Dashboard';
import OpportunityManager from './pages/ngo/OpportunityManager';
import ApplicantDashboard from './pages/ngo/ApplicantDashboard';
import TaskManager from './pages/ngo/TaskManager';
import TaskReview from './pages/ngo/TaskReview';
import AwardMedals from './pages/ngo/AwardMedals';
import NGOProfile from './pages/ngo/Profile';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Onboarding */}
        <Route path="/onboarding/volunteer" element={<ProtectedRoute><VolunteerOnboarding /></ProtectedRoute>} />
        <Route path="/onboarding/ngo" element={<ProtectedRoute><NGOOnboarding /></ProtectedRoute>} />
        
        {/* Volunteer Routes */}
        <Route path="/volunteer" element={<ProtectedRoute userType="volunteer"><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/volunteer/dashboard" replace />} />
          <Route path="dashboard" element={<VolunteerDashboard />} />
          <Route path="swipe" element={<SwipeDeck />} />
          <Route path="saved" element={<SavedOpportunities />} />
          <Route path="applied" element={<Applied />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="missions" element={<MyMissions />} />
          <Route path="tasks" element={<TaskBoard />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="chat/:matchId" element={<Chat />} />
        </Route>
        
        {/* NGO Routes */}
        <Route path="/ngo" element={<ProtectedRoute userType="ngo"><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/ngo/dashboard" replace />} />
          <Route path="dashboard" element={<NGODashboard />} />
          <Route path="opportunities" element={<OpportunityManager />} />
          <Route path="applicants" element={<ApplicantDashboard />} />
          <Route path="tasks" element={<TaskManager />} />
          <Route path="task-review" element={<TaskReview />} />
          <Route path="award-medals" element={<AwardMedals />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<NGOProfile />} />
          <Route path="chat/:matchId" element={<Chat />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

