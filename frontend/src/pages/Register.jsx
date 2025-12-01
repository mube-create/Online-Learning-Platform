import React, { useState } from 'react';
import { apiCall, showToast } from '../utils/api';
import './registry.css';

const Register = ({ onLogin, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await apiCall('/register', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role
        })
      });
      
      showToast('Account created successfully! Redirecting to login...');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
      });
      
      // Switch to login after successful registration
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
      
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registry-container">
      <div className="registry-box">
        <div className="registry-header">
          <div className="registry-logo">
            <i className="fas fa-graduation-cap"></i>
            <h1>Join LearnPro</h1>
          </div>
          <p className="registry-subtitle">Create your account and start learning today</p>
        </div>

        <form className="registry-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`form-input ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={`form-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`form-input ${errors.password ? 'error' : ''}`}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              I want to join as a *
            </label>
            <div className="role-options">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                />
                <div className="role-card">
                  <i className="fas fa-user-graduate"></i>
                  <div className="role-info">
                    <h4>Student</h4>
                    <p>I want to learn and take courses</p>
                  </div>
                </div>
              </label>

              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="instructor"
                  checked={formData.role === 'instructor'}
                  onChange={handleChange}
                />
                <div className="role-card">
                  <i className="fas fa-chalkboard-teacher"></i>
                  <div className="role-info">
                    <h4>Instructor</h4>
                    <p>I want to teach and create courses</p>
                  </div>
                </div>
              </label>
            </div>
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

          <div className="form-terms">
            <label className="terms-checkbox">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </label>
          </div>

          <button 
            type="submit" 
            className="registry-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="registry-footer">
          <p>
            Already have an account?{' '}
            <button className="switch-link" onClick={onSwitchToLogin}>
              Sign in here
            </button>
          </p>
        </div>

        <div className="demo-credentials">
          <div className="demo-header">
            <i className="fas fa-lightbulb"></i>
            <span>Quick Start</span>
          </div>
          <p>Use these demo credentials to test the platform:</p>
          <div className="demo-accounts">
            <div className="demo-account">
              <strong>Admin Account:</strong>
              <code>admin@example.com</code> / <code>admin123</code>
            </div>
            <div className="demo-account">
              <strong>Student Account:</strong>
              <code>student@example.com</code> / <code>student123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;