import React, { useState, useEffect } from 'react';
import { apiCall, showToast } from '../utils/api';
import './courses.css';

const Courses = ({ user, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadCourses();
    loadEnrolledCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const result = await apiCall('/courses');
      setCourses(result.courses);
    } catch (error) {
      showToast('Error loading courses');
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      const result = await apiCall(`/my-courses/${user.id}`);
      setEnrolledCourses(result.enrollments || []);
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      await apiCall('/enroll', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          courseId: courseId
        })
      });
      
      showToast('Successfully enrolled in the course!');
      loadEnrolledCourses(); // Refresh enrolled courses
    } catch (error) {
      showToast(error.message);
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(enrollment => enrollment.course?._id === courseId);
  };

  if (loading) {
    return <div className="courses-loading">Loading courses...</div>;
  }

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
              className="nav-link active"
            >
              <i className="fas fa-book-open"></i> Courses
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
            <h2>Available Courses</h2>
            <p>Browse and enroll in our wide range of courses</p>
          </div>
          <div className="user-info">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2a5298&color=fff`} alt={user.name} />
            <div className="user-details">
              <h4>{user.name}</h4>
              <p>{user.role}</p>
            </div>
          </div>
        </div>

        <div className="courses-grid">
          {courses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-image">
                <img src={course.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400'} alt={course.title} />
                <div className="course-level">{course.level}</div>
              </div>
              <div className="course-content">
                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span><i className="fas fa-user"></i> {course.instructor}</span>
                  <span><i className="fas fa-clock"></i> {course.duration}</span>
                  <span><i className="fas fa-dollar-sign"></i> {course.price || 'Free'}</span>
                </div>
                <div className="course-actions">
                  {isEnrolled(course._id) ? (
                    <button className="btn btn-success" disabled>
                      <i className="fas fa-check"></i> Enrolled
                    </button>
                  ) : (
                    <button 
                      className="btn" 
                      onClick={() => enrollInCourse(course._id)}
                    >
                      Enroll Now
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedCourse(course)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Course Detail Modal */}
        {selectedCourse && (
          <div className="modal show">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{selectedCourse.title}</h3>
                <button className="close-btn" onClick={() => setSelectedCourse(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="course-detail">
                  <img src={selectedCourse.image} alt={selectedCourse.title} className="course-detail-image" />
                  <div className="course-detail-info">
                    <p><strong>Instructor:</strong> {selectedCourse.instructor}</p>
                    <p><strong>Duration:</strong> {selectedCourse.duration}</p>
                    <p><strong>Level:</strong> {selectedCourse.level}</p>
                    <p><strong>Category:</strong> {selectedCourse.category}</p>
                    <p><strong>Price:</strong> ${selectedCourse.price || 'Free'}</p>
                  </div>
                  <div className="course-description-full">
                    <h4>Course Description</h4>
                    <p>{selectedCourse.description}</p>
                  </div>
                  <div className="course-actions">
                    {isEnrolled(selectedCourse._id) ? (
                      <button className="btn btn-success" disabled>
                        <i className="fas fa-check"></i> Already Enrolled
                      </button>
                    ) : (
                      <button 
                        className="btn" 
                        onClick={() => {
                          enrollInCourse(selectedCourse._id);
                          setSelectedCourse(null);
                        }}
                      >
                        Enroll in this Course
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;