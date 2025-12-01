import React, { useState } from 'react';
import { apiCall, showToast } from '../utils/api';
import './CourseCreation.css';

const CourseCreation = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: '',
    price: '',
    duration: '',
    level: 'beginner',
    image: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiCall('/courses/create', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseInt(formData.price) : 0,
          createdBy: user.id
        })
      });
      
      showToast('Course created successfully!');
      setFormData({
        title: '',
        description: '',
        instructor: '',
        category: '',
        price: '',
        duration: '',
        level: 'beginner',
        image: ''
      });
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">
          <i className="fas fa-graduation-cap"></i>
          <h1>LearnPro</h1>
        </div>
        <ul className="nav-links">
          <li>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="nav-link"
            >
              <i className="fas fa-th-large"></i> Dashboard
            </button>
          </li>
          <li>
            <button 
              onClick={() => window.location.href = '/courses'}
              className="nav-link"
            >
              <i className="fas fa-book-open"></i> Courses
            </button>
          </li>
          <li>
            <button className="nav-link active">
              <i className="fas fa-plus-circle"></i> Create Course
            </button>
          </li>
          <li>
            <button 
              onClick={() => window.location.href = '/quiz'}
              className="nav-link"
            >
              <i className="fas fa-question-circle"></i> Quiz
            </button>
          </li>
          <li className="logout">
            <button onClick={onLogout} className="nav-link logout-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="welcome">
            <h2>Create New Course</h2>
            <p>Share your knowledge with the world</p>
          </div>
          <div className="user-info">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2a5298&color=fff`} alt={user.name} />
            <div className="user-details">
              <h4>{user.name}</h4>
              <p>{user.role}</p>
            </div>
          </div>
        </div>

        <div className="course-creation-form">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Course Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="instructor">Instructor Name *</label>
                <input
                  type="text"
                  id="instructor"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleChange}
                  placeholder="Enter instructor name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Course Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what students will learn in this course"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="level">Difficulty Level</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">Duration *</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 8 weeks, 12 hours"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0 for free course"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image">Course Image URL</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <small>Leave empty to use default image</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Creating Course...' : 'Create Course'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => window.location.href = '/courses'}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseCreation;