import React, { useState, useEffect } from 'react';
import './styles.css';

// Courses Component with API integration
const Courses = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchMyCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/courses');
      const result = await response.json();
      if (result.success) {
        setCourses(result.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    try {
      const response = await fetch(`http://localhost:3000/my-courses/${user.id}`);
      const result = await response.json();
      if (result.success) {
        setEnrolledCourses(result.enrollments);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const enrollInCourse = async (courseId) => {
    setEnrolling(courseId);
    try {
      const response = await fetch('http://localhost:3000/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: courseId
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Enrolled successfully!');
        fetchMyCourses();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Error enrolling in course');
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(enrollment => enrollment.course._id === courseId);
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Available Courses</h1>
        <p>Expand your knowledge with our curated courses</p>
      </div>

      <div className="courses-grid">
        {courses.map(course => (
          <div key={course._id} className="course-card">
            <div className="course-image">
              <img src={course.image} alt={course.title} />
            </div>
            <div className="course-content">
              <h3>{course.title}</h3>
              <p className="course-description">{course.description}</p>
              
              <div className="course-meta">
                <span className="instructor">👨‍🏫 {course.instructor}</span>
                <span className="duration">⏱️ {course.duration}</span>
                <span className="level">📊 {course.level}</span>
              </div>
              
              <div className="course-footer">
                <div className="price">${course.price}</div>
                {user ? (
                  isEnrolled(course._id) ? (
                    <button className="enrolled-btn" disabled>
                      ✅ Enrolled
                    </button>
                  ) : (
                    <button 
                      className="enroll-btn"
                      onClick={() => enrollInCourse(course._id)}
                      disabled={enrolling === course._id}
                    >
                      {enrolling === course._id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )
                ) : (
                  <button className="login-to-enroll" disabled>
                    Login to Enroll
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="no-courses">
          <p>No courses available at the moment.</p>
          <button 
            onClick={() => window.open('http://localhost:3000/create-sample-courses', '_blank')}
            className="create-sample-btn"
          >
            Create Sample Courses
          </button>
        </div>
      )}
    </div>
  );
};

// Register Component
const Register = ({ onSwitchToLogin, onRegister }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', fontSize: '28px', marginBottom: '5px' }}>
            Create Account
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Join our learning community
          </p>
        </div>
        
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Registration feature coming soon!</p>
          <button 
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontWeight: '600',
              textDecoration: 'underline',
              marginTop: '10px'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      
      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please check if backend is running.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowRegister(false);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setError('');
  };

  const handleSwitchToRegister = () => {
    setShowRegister(true);
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <Courses user={user} />;
      case 'dashboard':
      default:
        return (
          <div className="dashboard-content">
            <div className="welcome-card">
              <h2>🎉 Welcome to Your Dashboard!</h2>
              <div className="user-details">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> <span className="role-badge">{user.role}</span></p>
              </div>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <h3>📚 Available Courses</h3>
                <p>Browse and enroll in courses</p>
                <button 
                  className="feature-btn"
                  onClick={() => setActiveTab('courses')}
                >
                  View Courses
                </button>
              </div>
              
              <div className="feature-card">
                <h3>🎓 My Learning</h3>
                <p>Track your progress</p>
                <button className="feature-btn">My Progress</button>
              </div>
              
              <div className="feature-card">
                <h3>👨‍🏫 Instructors</h3>
                <p>Learn from experts</p>
                <button className="feature-btn">Meet Instructors</button>
              </div>
              
              <div className="feature-card">
                <h3>📊 Analytics</h3>
                <p>View your performance</p>
                <button className="feature-btn">See Analytics</button>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user && showRegister) {
    return <Register onSwitchToLogin={handleSwitchToLogin} onRegister={handleRegister} />;
  }

  if (!user && !showRegister) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="logo">
            <h1>Online Learning Platform</h1>
            <p>Welcome back! Please login to your account.</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
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
                placeholder="Enter your password"
              />
            </div>
            
            <button 
              type="submit" 
              className="login-btn"
              disabled={loginLoading}
            >
              {loginLoading ? 'Logging in...' : 'Login to Account'}
            </button>
          </form>
          
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
          
          <div className="auth-switch">
            <p>Don't have an account? 
              <button onClick={handleSwitchToRegister} className="switch-btn">
                Sign up here
              </button>
            </p>
          </div>
          
          <div className="demo-credentials">
            <h3>Demo Credentials:</h3>
            <p>📧 Email: admin@example.com</p>
            <p>🔑 Password: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Online Learning Platform</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <div className="nav-tabs">
              <button 
                className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`nav-tab ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => setActiveTab('courses')}
              >
                Courses
              </button>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {renderContent()}
    </div>
  );
}

export default App;