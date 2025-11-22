import React, { useState } from 'react';
import './CourseCreation.css';

const CourseCreation = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: user?.name || '',
    category: '',
    price: '',
    duration: '',
    level: 'beginner',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Web Development',
    'Data Science',
    'Mobile Development',
    'Design',
    'Business',
    'Marketing',
    'Photography',
    'Music'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/courses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price) || 0,
          createdBy: user.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        setFormData({
          title: '',
          description: '',
          instructor: user?.name || '',
          category: '',
          price: '',
          duration: '',
          level: 'beginner',
          image: ''
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(result.message || 'Error creating course');
      }
    } catch (error) {
      setError('Network error during course creation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-creation">
      <div className="creation-header">
        <h1>Create New Course</h1>
        <p>Share your knowledge with the world</p>
      </div>

      <form onSubmit={handleSubmit} className="creation-form">
        <div className="form-row">
          <div className="form-group full-width">
            <label>Course Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Advanced JavaScript Patterns"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Course Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe what students will learn in this course..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Instructor Name *</label>
            <input
              type="text"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0 for free"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Duration *</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              placeholder="e.g., 8 weeks, 12 hours"
            />
          </div>

          <div className="form-group">
            <label>Level</label>
            <select 
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
          <div className="form-group full-width">
            <label>Course Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <small>Leave empty to use default image</small>
          </div>
        </div>

        <button 
          type="submit" 
          className="create-course-btn"
          disabled={loading}
        >
          {loading ? 'Creating Course...' : 'Create Course'}
        </button>
      </form>

      {success && (
        <div className="success-message">
          ✅ Course created successfully! It's now available in the courses list.
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="creation-tips">
        <h3>💡 Tips for a Great Course</h3>
        <ul>
          <li>Write a clear and compelling title</li>
          <li>Provide detailed learning objectives</li>
          <li>Set an appropriate difficulty level</li>
          <li>Use high-quality images</li>
          <li>Be specific about course duration</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseCreation;