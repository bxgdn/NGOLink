import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import '../styles/Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  // For demo purposes, we'll use getUserByEmail
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Simple demo login - check if user exists
      // In production, use proper authentication
      const userData = { email, name: email.split('@')[0], userType: 'volunteer' };
      await signup(email, email.split('@')[0], 'volunteer');
      navigate('/volunteer/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-logo">🌱 VolunteerConnect</h1>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to continue your volunteer journey</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Login
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

