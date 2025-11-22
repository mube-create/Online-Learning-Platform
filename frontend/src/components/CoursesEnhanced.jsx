import React, { useState, useEffect } from 'react';
import './CoursesEnhanced.css';

const CoursesEnhanced = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    fetchCoursesWithFilters();
    if (user) {
      fetchMyCourses();
    }
  }, [user, searchQuery, selectedCategory, selectedLevel, minPrice, maxPrice, sortBy]);

  const fetchCoursesWithFilters = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLevel !== 'all') params.append('level', selectedLevel);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);

      const response = await fetch(`http://localhost:3000/courses/search?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setCourses(result.courses);
        setFilteredCourses(result.courses);
        setCategories(result.filters.categories);
        setLevels(result.filters.levels);
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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="courses-enhanced">
      <div className="courses-header">
        <h1>Discover Courses</h1>
        <p>Find the perfect course to advance your skills</p>
      </div>

      {/* Search and Filters Section */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search courses, instructors, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        <div className="filter-grid">
          <div className="filter-group">
            <label>Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Level</label>
            <select 
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Min Price</label>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Max Price</label>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>

        <div className="results-info">
          <span>{filteredCourses.length} courses found</span>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.map(course => (
          <div key={course._id} className="course-card">
            <div className="course-image">
              <img src={course.image} alt={course.title} />
              <div className="course-level-badge">{course.level}</div>
            </div>
            <div className="course-content">
              <h3>{course.title}</h3>
              <p className="course-description">{course.description}</p>
              
              <div className="course-meta">
                <span className="instructor">👨‍🏫 {course.instructor}</span>
                <span className="duration">⏱️ {course.duration}</span>
                <span className="category">📁 {course.category}</span>
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

      {filteredCourses.length === 0 && (
        <div className="no-courses">
          <p>No courses found matching your criteria.</p>
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CoursesEnhanced;