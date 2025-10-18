import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const createUser = useMutation(api.users.createUser);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Fetch full user data when we have a user ID
  const user = useQuery(
    api.users.getUser,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const login = async (email, password) => {
    // Simple auth - in production, use proper authentication
    const userRecord = await fetch('/.netlify/functions/getUserByEmail', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }).then(r => r.json());

    if (userRecord) {
      const userData = {
        userId: userRecord._id,
        email: userRecord.email,
        name: userRecord.name,
        userType: userRecord.userType,
      };
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return userData;
    }
    throw new Error('User not found');
  };

  const signup = async (email, name, userType) => {
    const userId = await createUser({ email, name, userType });
    const userData = { userId, email, name, userType };
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

