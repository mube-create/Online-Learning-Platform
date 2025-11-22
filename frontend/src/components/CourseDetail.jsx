import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './CourseDetail.css';

const CourseDetail = ({ user }) => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`http://localhost:3000/courses/${courseId}`);
      const result = await response.json();
      if (result.success) {
        setCourse(result.course);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async () => {
    setEnrolling(true);
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
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Error enrolling in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }

  if (!course) {
    return <div className="error">Course not found</div>;
  }

  return (
    <div className="course-detail">
      <div className="course-hero">
        <div className="course-image">
          <img src={course.image} alt={course.title} />
        </div>
        <div className="course-info">
          <h1>{course.title}</h1>
          <p className="course-description">{course.description}</p>
          
          <div className="course-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Instructor</span>
              <span className="meta-value">👨‍🏫 {course.instructor}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Duration</span>
              <span className="meta-value">⏱️ {course.duration}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Level</span>
              <span className="meta-value">📊 {course.level}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Category</span>
              <span className="meta-value">📁 {course.category}</span>
            </div>
          </div>
          
          <div className="enrollment-section">
            <div className="price">${course.price}</div>
            {user ? (
              <button 
                className="enroll-btn-large"
                onClick={enrollInCourse}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            ) : (
              <button className="login-to-enroll-large" disabled>
                Login to Enroll
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="course-content">
        <div className="content-section">
          <h2>About This Course</h2>
          <p>{course.description}</p>
        </div>

        <div className="content-section">
          <h2>What You'll Learn</h2>
          <ul className="learning-list">
            <li>Master key concepts and skills</li>
            <li>Build real-world projects</li>
            <li>Get personalized feedback</li>
            <li>Join a community of learners</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>Course Curriculum</h2>
          <div className="curriculum">
            <div className="module">
              <h4>Module 1: Introduction</h4>
              <div className="lessons">
                <div className="lesson">Welcome to the course</div>
                <div className="lesson">Setting up your environment</div>
                <div className="lesson">Course overview</div>
              </div>
            </div>
            <div className="module">
              <h4>Module 2: Core Concepts</h4>
              <div className="lessons">
                <div className="lesson">Fundamental principles</div>
                <div className="lesson">Hands-on exercises</div>
                <div className="lesson">Practice projects</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;