import React, { useState, useEffect } from 'react';
import { apiCall, showToast } from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        apiCall('/admin/stats'),
        apiCall('/admin/users')
      ]);
      
      setStats(statsRes.stats);
      setUsers(usersRes.users);
    } catch (error) {
      showToast('Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await apiCall(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      
      showToast('User role updated successfully');
      loadAdminData(); // Refresh data
    } catch (error) {
      showToast(error.message);
    }
  };

  if (loading) {
    return <div className="admin-dashboard loading">Loading admin data...</div>;
  }

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">
          <i className="fas fa-graduation-cap"></i>
          <h1>LearnPro</h1>
        </div>
        <ul className="nav-links">
          <li><a href="#" className="active"><i className="fas fa-th-large"></i> Admin Dashboard</a></li>
          <li><a href="#" onClick={onLogout}><i className="fas fa-sign-out-alt"></i> Logout</a></li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="welcome">
            <h2>Admin Dashboard</h2>
            <p>Manage your learning platform</p>
          </div>
          <div className="user-info">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2a5298&color=fff`} alt={user.name} />
            <div className="user-details">
              <h4>{user.name}</h4>
              <p>Administrator</p>
            </div>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Total Users</h3>
            </div>
            <div className="card-stat">{stats.totalUsers}</div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-book"></i>
              </div>
              <h3>Total Courses</h3>
            </div>
            <div className="card-stat">{stats.totalCourses}</div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3>Total Enrollments</h3>
            </div>
            <div className="card-stat">{stats.totalEnrollments}</div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <h3>Total Revenue</h3>
            </div>
            <div className="card-stat">${stats.totalRevenue}</div>
          </div>
        </div>

        <div className="admin-section">
          <h3>User Management</h3>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
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
      </div>
    </div>
  );
};

export default AdminDashboard;