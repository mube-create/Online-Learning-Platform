import React, { useState, useEffect } from 'react';
import './Courses.css';

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

// MAKE SURE THIS LINE IS AT THE END - This is the default export
export default Courses;