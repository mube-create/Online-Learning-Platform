const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/online_learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Course Schema
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, default: 0 },
  duration: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  image: { type: String, default: '' },
  isPublished: { type: Boolean, default: false },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

// Enrollment Schema
const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// ========== USER ROUTES ==========

// Update user role (admin only)
app.put('/admin/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User registration
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'student'
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'User registered successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Create admin user endpoint
app.get('/init', async (req, res) => {
  try {
    let admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      res.json({ 
        success: true,
        message: '✅ Admin user created successfully!', 
        credentials: {
          email: 'admin@example.com',
          password: 'admin123'
        }
      });
    } else {
      res.json({ 
        success: true,
        message: '✅ Admin user already exists', 
        credentials: {
          email: 'admin@example.com',
          password: 'admin123'
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// ========== COURSE ROUTES ==========

// Get all courses
app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single course
app.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced courses endpoint with search and filtering
app.get('/courses/search', async (req, res) => {
  try {
    const { query, category, level, minPrice, maxPrice, sortBy } = req.query;
    
    // Build filter object
    let filter = { isPublished: true };
    
    // Text search
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { instructor: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Level filter
    if (level && level !== 'all') {
      filter.level = level;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    
    // Build sort object
    let sort = {};
    switch(sortBy) {
      case 'price-low':
        sort.price = 1;
        break;
      case 'price-high':
        sort.price = -1;
        break;
      case 'duration':
        sort.duration = 1;
        break;
      default:
        sort.createdAt = -1;
    }
    
    const courses = await Course.find(filter).sort(sort);
    
    // Get unique categories for filters
    const categories = await Course.distinct('category', { isPublished: true });
    const levels = await Course.distinct('level', { isPublished: true });
    
    res.json({ 
      success: true, 
      courses,
      filters: {
        categories,
        levels
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new course (for instructors/admin)
app.post('/courses/create', async (req, res) => {
  try {
    const { title, description, instructor, category, price, duration, level, image, createdBy } = req.body;
    
    // Validate required fields
    if (!title || !description || !instructor || !category || !duration) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill all required fields' 
      });
    }
    
    const course = new Course({
      title,
      description,
      instructor,
      category,
      price: price || 0,
      duration,
      level: level || 'beginner',
      image: image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
      isPublished: true,
      createdBy: createdBy
    });
    
    await course.save();
    
    res.json({ 
      success: true, 
      message: 'Course created successfully!',
      course 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create sample courses
app.get('/create-sample-courses', async (req, res) => {
  try {
    const sampleCourses = [
      {
        title: "Web Development Bootcamp",
        description: "Learn full-stack web development with HTML, CSS, JavaScript, React, and Node.js",
        instructor: "Sarah Johnson",
        category: "Web Development",
        price: 99,
        duration: "12 weeks",
        level: "beginner",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
        isPublished: true
      },
      {
        title: "Data Science Fundamentals",
        description: "Master Python, statistics, and machine learning for data analysis",
        instructor: "Mike Chen",
        category: "Data Science",
        price: 129,
        duration: "10 weeks",
        level: "intermediate",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        isPublished: true
      },
      {
        title: "Mobile App Development with React Native",
        description: "Build cross-platform mobile apps using React Native",
        instructor: "Emily Davis",
        category: "Mobile Development",
        price: 89,
        duration: "8 weeks",
        level: "intermediate",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
        isPublished: true
      },
      {
        title: "UI/UX Design Principles",
        description: "Learn user interface and user experience design best practices",
        instructor: "Alex Rodriguez",
        category: "Design",
        price: 79,
        duration: "6 weeks",
        level: "beginner",
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
        isPublished: true
      }
    ];

    await Course.deleteMany({});
    const courses = await Course.insertMany(sampleCourses);
    
    res.json({ 
      success: true, 
      message: 'Sample courses created successfully',
      courses 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Publish all existing courses
app.get('/publish-courses', async (req, res) => {
  try {
    const result = await Course.updateMany({}, { $set: { isPublished: true } });
    res.json({ 
      success: true, 
      message: `Published ${result.modifiedCount} courses`,
      result 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ENROLLMENT ROUTES ==========

// Enroll in a course
app.post('/enroll', async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }
    
    const enrollment = new Enrollment({
      user: userId,
      course: courseId
    });
    
    await enrollment.save();
    
    // Add student to course's enrolled students
    await Course.findByIdAndUpdate(courseId, {
      $push: { enrolledStudents: userId }
    });
    
    res.json({ 
      success: true, 
      message: 'Enrolled successfully',
      enrollment 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's enrolled courses
app.get('/my-courses/:userId', async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.params.userId })
      .populate('course')
      .populate('user', 'name email');
    
    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ADMIN ROUTES ==========

// Get all users (admin only)
app.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get admin stats
app.get('/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalRevenue = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$course.price' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== TEST ROUTE ==========

app.get('/', (req, res) => {
  res.json({ 
    message: 'Online Learning Platform Backend is running!',
    endpoints: {
      auth: {
        register: 'POST /register',
        login: 'POST /login',
        init: 'GET /init'
      },
      courses: {
        list: 'GET /courses',
        search: 'GET /courses/search',
        create: 'POST /courses/create',
        sample: 'GET /create-sample-courses'
      },
      admin: {
        users: 'GET /admin/users',
        stats: 'GET /admin/stats'
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Initialize admin: http://localhost:${PORT}/init`);
  console.log(`📚 Create sample courses: http://localhost:${PORT}/create-sample-courses`);
});