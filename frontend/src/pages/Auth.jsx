import React, { useState } from 'react';
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' // Default role
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showToast = (message) => {
    // Simple alert for now
    alert(message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple validation
    if (!formData.email || !formData.password) {
      showToast('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match');
      setLoading(false);
      return;
    }

    // Always use mock authentication - NO API CALLS
    const mockUser = {
      id: '1',
      name: isLogin ? 'Demo User' : formData.name,
      email: formData.email,
      role: formData.role // Use the selected role
    };
    
    // Simulate API delay
    setTimeout(() => {
      onLogin(mockUser);
      showToast(`${isLogin ? 'Login' : 'Registration'} successful as ${formData.role}!`);
      setLoading(false);
    }, 500);
  };

  const handleDemoLogin = () => {
    setLoading(true);
    
    const demoUser = {
      id: '1',
      name: 'Demo User',
      email: 'demo@learnpro.com',
      role: 'student'
    };
    
    setTimeout(() => {
      onLogin(demoUser);
      showToast('Demo login successful!');
      setLoading(false);
    }, 300);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student'
    });
  };

  return (
    <div className="auth-container compact">
      <div className="auth-box compact">
        <div className="auth-header">
          <i className="fas fa-graduation-cap"></i>
          <h2>LearnPro</h2>
          <p>{isLogin ? 'Sign in to your account' : 'Create your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form compact">
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Selection - Only show for login form */}
          {isLogin && (
            <div className="form-group">
              <label htmlFor="role">Login as:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
          )}

          {!isLogin && (
            <>
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Register as:</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required={!isLogin}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="auth-btn" 
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="demo-login compact">
          <div className="demo-separator">
            <span>Or try demo</span>
          </div>
          <button 
            type="button"
            className="demo-btn"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <i className="fas fa-rocket"></i>
            {loading ? 'Logging in...' : 'Quick Demo Login'}
          </button>
        </div>

        <div className="auth-footer compact">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="toggle-btn"
              onClick={toggleMode}
              disabled={loading}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;