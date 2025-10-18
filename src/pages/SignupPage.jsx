import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'volunteer',
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signup(formData.email, formData.name, formData.userType);
      
      // Navigate to onboarding
      if (formData.userType === 'volunteer') {
        navigate('/onboarding/volunteer');
      } else {
        navigate('/onboarding/ngo');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-logo">🌱 VolunteerConnect</h1>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join our community and start making an impact</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>I am a...</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="userType"
                    value="volunteer"
                    checked={formData.userType === 'volunteer'}
                    onChange={handleChange}
                  />
                  <span>Volunteer</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="userType"
                    value="ngo"
                    checked={formData.userType === 'ngo'}
                    onChange={handleChange}
                  />
                  <span>NGO / Organization</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Create Account
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

