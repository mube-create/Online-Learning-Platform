import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Auth from './pages/Auth';
import AdminDashboard from './components/AdminDashboard';
import Courses from './components/Courses';
import CourseCreation from './components/CourseCreation';
import Quiz from './components/Quiz';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            currentUser ? (
              <Navigate to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <Auth onLogin={handleLogin} />
            )
          } 
        />

        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard user={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <MainDashboard user={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/courses" 
          element={
            <ProtectedRoute>
              <Courses user={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/create-course" 
          element={
            <ProtectedRoute allowedRoles={['instructor', 'admin']}>
              <CourseCreation user={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/quiz" 
          element={
            <ProtectedRoute>
              <Quiz user={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/" 
          element={
            <Navigate to={
              currentUser 
                ? (currentUser.role === 'admin' ? '/admin' : '/dashboard')
                : '/login'
            } replace />
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// MainDashboard with consistent button sizes
const MainDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleNavigation = (section) => {
    setActiveSection(section);
    if (section === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/${section}`);
    }
  };

  // Consistent button styles
  const navButtonStyle = (isActive = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    color: 'white',
    background: isActive ? 'rgba(255,255,255,0.2)' : 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    borderRight: isActive ? '3px solid #fff' : 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  });

  const logoutButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    color: '#ff6b6b',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  };

  const hoverStyle = {
    background: 'rgba(255, 255, 255, 0.1)'
  };

  const logoutHoverStyle = {
    background: 'rgba(255, 107, 107, 0.1)'
  };

  const styles = {
    container: { display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
    sidebar: { width: '250px', background: 'linear-gradient(135deg, #1e3c72, #2a5298)', color: 'white', padding: '20px 0' },
    logo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
    navLinks: { listStyle: 'none', marginTop: '20px', padding: '0' },
    navLink: { marginBottom: '0' },
    mainContent: { flex: 1, padding: '20px', background: '#f5f5f5' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    dashboardCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    card: { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
    cardIcon: { width: '50px', height: '50px', background: 'linear-gradient(135deg, #1e3c72, #2a5298)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' },
    btn: { background: 'linear-gradient(135deg, #1e3c72, #2a5298)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', textDecoration: 'none', display: 'inline-block' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
    profileInfo: { marginTop: '15px' },
    logoutSection: { marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'courses':
        return <Courses user={user} onLogout={onLogout} />;
      case 'create-course':
        return <CourseCreation user={user} onLogout={onLogout} />;
      case 'quiz':
        return <Quiz user={user} onLogout={handleLogout} />;
      default:
        return (
          <div style={styles.mainContent}>
            <div style={styles.header}>
              <div className="welcome">
                <h2>Welcome back, {user.name}!</h2>
                <p>Here's what's happening with your courses today.</p>
              </div>
              <div style={styles.userInfo}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2a5298&color=fff`} alt={user.name} width="50" height="50" style={{borderRadius: '50%', border: '3px solid #2a5298'}} />
                <div className="user-details">
                  <h4>{user.name}</h4>
                  <p>{user.role}</p>
                </div>
              </div>
            </div>

            <div style={styles.dashboardCards}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardIcon}>
                    <i className="fas fa-book"></i>
                  </div>
                  <h3>Available Courses</h3>
                </div>
                <p>Browse and enroll in our wide range of courses.</p>
                <button 
                  style={styles.btn} 
                  onClick={() => handleNavigation('courses')}
                >
                  View Courses
                </button>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardIcon}>
                    <i className="fas fa-question-circle"></i>
                  </div>
                  <h3>Take Quizzes</h3>
                </div>
                <p>Test your knowledge with our interactive quizzes.</p>
                <button 
                  style={styles.btn} 
                  onClick={() => handleNavigation('quiz')}
                >
                  Start Quiz
                </button>
              </div>

              {user.role === 'instructor' && (
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardIcon}>
                      <i className="fas fa-plus-circle"></i>
                    </div>
                    <h3>Create Course</h3>
                  </div>
                  <p>Share your knowledge by creating a new course.</p>
                  <button 
                    style={styles.btn} 
                    onClick={() => handleNavigation('create-course')}
                  >
                    Create Course
                  </button>
                </div>
              )}

              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardIcon}>
                    <i className="fas fa-user"></i>
                  </div>
                  <h3>Your Profile</h3>
                </div>
                <p>View and manage your account information.</p>
                <div style={styles.profileInfo}>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <i className="fas fa-graduation-cap"></i>
          <h1>LearnPro</h1>
        </div>
        <ul style={styles.navLinks}>
          <li style={styles.navLink}>
            <button 
              onClick={() => handleNavigation('dashboard')}
              style={navButtonStyle(activeSection === 'dashboard')}
              onMouseEnter={(e) => {
                if (activeSection !== 'dashboard') {
                  e.target.style.background = hoverStyle.background;
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'dashboard') {
                  e.target.style.background = 'none';
                }
              }}
            >
              <i className="fas fa-th-large"></i> Dashboard
            </button>
          </li>
          <li style={styles.navLink}>
            <button 
              onClick={() => handleNavigation('courses')}
              style={navButtonStyle(activeSection === 'courses')}
              onMouseEnter={(e) => {
                if (activeSection !== 'courses') {
                  e.target.style.background = hoverStyle.background;
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'courses') {
                  e.target.style.background = 'none';
                }
              }}
            >
              <i className="fas fa-book-open"></i> Courses
            </button>
          </li>
          {user.role === 'instructor' && (
            <li style={styles.navLink}>
              <button 
                onClick={() => handleNavigation('create-course')}
                style={navButtonStyle(activeSection === 'create-course')}
                onMouseEnter={(e) => {
                  if (activeSection !== 'create-course') {
                    e.target.style.background = hoverStyle.background;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== 'create-course') {
                    e.target.style.background = 'none';
                  }
                }}
              >
                <i className="fas fa-plus-circle"></i> Create Course
              </button>
            </li>
          )}
          <li style={styles.navLink}>
            <button 
              onClick={() => handleNavigation('quiz')}
              style={navButtonStyle(activeSection === 'quiz')}
              onMouseEnter={(e) => {
                if (activeSection !== 'quiz') {
                  e.target.style.background = hoverStyle.background;
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'quiz') {
                  e.target.style.background = 'none';
                }
              }}
            >
              <i className="fas fa-question-circle"></i> Quiz
            </button>
          </li>
          <li style={styles.logoutSection}>
            <button 
              onClick={onLogout} 
              style={logoutButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = logoutHoverStyle.background;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
              }}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </li>
        </ul>
      </div>

      {renderContent()}
    </div>
  );
};

export default App;