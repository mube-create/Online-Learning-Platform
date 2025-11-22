import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        fetch('http://localhost:3000/admin/stats'),
        fetch('http://localhost:3000/admin/users'),
        fetch('http://localhost:3000/courses')
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const coursesData = await coursesRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (usersData.success) setUsers(usersData.users);
      if (coursesData.success) setCourses(coursesData.courses);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      // You'll need to add this endpoint to your backend
      const response = await fetch(`http://localhost:3000/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole })
      });

      const result = await response.json();
      if (result.success) {
        fetchAdminData(); // Refresh data
        alert('User role updated successfully!');
      }
    } catch (error) {
      alert('Error updating user role');
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your learning platform</p>
      </div>

      {/* Admin Navigation */}
      <div className="admin-nav">
        <button 
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`nav-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          📚 Courses
        </button>
        <button 
          className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📈 Reports
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="overview-tab">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <h3>{stats.totalCourses}</h3>
                <p>Total Courses</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎓</div>
              <div className="stat-info">
                <h3>{stats.totalEnrollments}</h3>
                <p>Total Enrollments</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>${stats.totalRevenue}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-icon">🎓</span>
                <div className="activity-details">
                  <p><strong>5 new enrollments</strong> in Web Development Bootcamp</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon">👤</span>
                <div className="activity-details">
                  <p><strong>3 new users</strong> registered today</p>
                  <span className="activity-time">5 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon">📚</span>
                <div className="activity-details">
                  <p><strong>New course</strong> "Advanced React Patterns" created</p>
                  <span className="activity-time">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="users-tab">
          <h2>User Management</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select 
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                        className="role-select"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="courses-tab">
          <h2>Course Management</h2>
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course._id} className="course-admin-card">
                <div className="course-admin-image">
                  <img src={course.image} alt={course.title} />
                </div>
                <div className="course-admin-info">
                  <h3>{course.title}</h3>
                  <p className="course-instructor">By {course.instructor}</p>
                  <div className="course-meta">
                    <span>${course.price}</span>
                    <span>⏱️ {course.duration}</span>
                    <span>📊 {course.level}</span>
                  </div>
                  <div className="enrollment-count">
                    📊 {course.enrolledStudents?.length || 0} students enrolled
                  </div>
                </div>
                <div className="course-actions">
                  <button className="btn-edit">Edit</button>
                  <button className="btn-delete">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="reports-tab">
          <h2>Financial Reports</h2>
          <div className="reports-grid">
            <div className="report-card">
              <h3>Revenue Overview</h3>
              <div className="revenue-stats">
                <div className="revenue-item">
                  <span>Today</span>
                  <strong>$0</strong>
                </div>
                <div className="revenue-item">
                  <span>This Week</span>
                  <strong>$0</strong>
                </div>
                <div className="revenue-item">
                  <span>This Month</span>
                  <strong>${stats?.totalRevenue || 0}</strong>
                </div>
                <div className="revenue-item">
                  <span>All Time</span>
                  <strong>${stats?.totalRevenue || 0}</strong>
                </div>
              </div>
            </div>

            <div className="report-card">
              <h3>Popular Courses</h3>
              <div className="popular-courses">
                {courses.slice(0, 3).map((course, index) => (
                  <div key={course._id} className="popular-course">
                    <span className="rank">{index + 1}</span>
                    <span className="course-name">{course.title}</span>
                    <span className="enrollments">{course.enrolledStudents?.length || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button className="action-btn">📥 Export Data</button>
                <button className="action-btn">📊 Generate Report</button>
                <button className="action-btn">🔄 Refresh Stats</button>
                <button className="action-btn">⚙️ Settings</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;