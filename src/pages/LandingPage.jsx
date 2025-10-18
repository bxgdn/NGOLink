import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Award, Users, CheckCircle } from 'lucide-react';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="container">
          <h1 className="logo">🌱 VolunteerConnect</h1>
          <div className="nav-links">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Connect Your Skills with Meaningful Causes</h1>
            <p className="hero-subtitle">
              Join thousands of volunteers making a difference through skill-based matching, 
              gamified tasks, and real impact.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
              <a href="#features" className="btn btn-outline btn-lg">Learn More</a>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <Heart size={32} className="icon" />
              <p>1000+ Opportunities</p>
            </div>
            <div className="floating-card card-2">
              <Users size={32} className="icon" />
              <p>500+ NGOs</p>
            </div>
            <div className="floating-card card-3">
              <Award size={32} className="icon" />
              <p>Earn Achievements</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Heart />
              </div>
              <h3>Smart Matching</h3>
              <p>Swipe through opportunities tailored to your skills and interests</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <CheckCircle />
              </div>
              <h3>Complete Tasks</h3>
              <p>Take on discrete, meaningful tasks that fit your schedule</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Award />
              </div>
              <h3>Earn Recognition</h3>
              <p>Unlock badges, medals, and climb the leaderboard</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3>Make Impact</h3>
              <p>Connect with verified NGOs and track your volunteer hours</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to Make a Difference?</h2>
          <p>Join our community of volunteers and start your journey today</p>
          <Link to="/signup" className="btn btn-primary btn-lg">Sign Up Now</Link>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 VolunteerConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

