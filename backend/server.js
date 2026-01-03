const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Load course data
const loadCourses = () => {
    const dataPath = path.join(__dirname, '../data/courses.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
};

// API Routes

// Get all courses or filter by category
app.get('/api/courses', (req, res) => {
    try {
        const data = loadCourses();
        const { category, search } = req.query;

        let courses = data.courses;

        // Filter by category
        if (category && category !== 'all') {
            courses = courses.filter(course =>
                course.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            courses = courses.filter(course =>
                course.title.toLowerCase().includes(searchLower) ||
                course.instructor.includes(search) ||
                course.category.toLowerCase().includes(searchLower)
            );
        }

        res.json({
            success: true,
            count: courses.length,
            courses: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
});

// Get single course by ID
app.get('/api/courses/:id', (req, res) => {
    try {
        const data = loadCourses();
        const courseId = parseInt(req.params.id);
        const course = data.courses.find(c => c.id === courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Get related courses (same category, excluding current)
        const relatedCourses = data.courses
            .filter(c => c.category === course.category && c.id !== courseId)
            .slice(0, 3);

        res.json({
            success: true,
            course: course,
            relatedCourses: relatedCourses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching course',
            error: error.message
        });
    }
});

// Get all categories
app.get('/api/categories', (req, res) => {
    try {
        const data = loadCourses();
        res.json({
            success: true,
            categories: data.categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // In a real application, you would save this to a database
        // For now, we'll just log it and return success
        console.log('Contact form submission:', { name, email, subject, message });

        res.json({
            success: true,
            message: 'Thank you for contacting us! We will get back to you soon.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting form',
            error: error.message
        });
    }
});

// Instructor registration
app.post('/api/become-instructor', (req, res) => {
    try {
        const { name, email, phone, expertise, experience, message } = req.body;

        console.log('Instructor registration:', { name, email, phone, expertise, experience, message });

        res.json({
            success: true,
            message: 'Thank you for your interest! We will review your application and contact you soon.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting application',
            error: error.message
        });
    }
});

// ===================================
// Authentication Endpoints
// ===================================

// Helper functions for user data
const loadUsers = () => {
    const dataPath = path.join(__dirname, '../data/users.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
};

const saveUsers = (users) => {
    const dataPath = path.join(__dirname, '../data/users.json');
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
};

const loadEnrollments = () => {
    const dataPath = path.join(__dirname, '../data/user-courses.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
};

const saveEnrollments = (enrollments) => {
    const dataPath = path.join(__dirname, '../data/user-courses.json');
    fs.writeFileSync(dataPath, JSON.stringify(enrollments, null, 2));
};

// User Registration
app.post('/api/auth/register', (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        const usersData = loadUsers();

        // Check if user already exists
        const existingUser = usersData.users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const newUser = {
            id: usersData.users.length + 1,
            name,
            email,
            password, // In production, hash this!
            createdAt: new Date().toISOString()
        };

        usersData.users.push(newUser);
        saveUsers(usersData);

        res.json({
            success: true,
            message: 'Registration successful!',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error during registration',
            error: error.message
        });
    }
});

// User Login
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const usersData = loadUsers();
        const user = usersData.users.find(u => u.email === email && u.password === password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        res.json({
            success: true,
            message: 'Login successful!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
});

// Get User Profile
app.get('/api/auth/profile/:userId', (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const usersData = loadUsers();
        const user = usersData.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's enrollments
        const enrollmentsData = loadEnrollments();
        const userEnrollments = enrollmentsData.enrollments.filter(e => e.userId === userId);

        // Get course details for enrollments
        const coursesData = loadCourses();
        const enrolledCourses = userEnrollments.map(enrollment => {
            const course = coursesData.courses.find(c => c.id === enrollment.courseId);
            return {
                ...course,
                progress: enrollment.progress,
                enrolledAt: enrollment.enrolledAt,
                completed: enrollment.completed
            };
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            },
            enrolledCourses: enrolledCourses,
            stats: {
                totalEnrolled: enrolledCourses.length,
                completed: enrolledCourses.filter(c => c.completed).length,
                inProgress: enrolledCourses.filter(c => !c.completed).length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// Enroll in Course
app.post('/api/enroll/:courseId', (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId);
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Check if course exists
        const coursesData = loadCourses();
        const course = coursesData.courses.find(c => c.id === courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user exists
        const usersData = loadUsers();
        const user = usersData.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already enrolled
        const enrollmentsData = loadEnrollments();
        const existingEnrollment = enrollmentsData.enrollments.find(
            e => e.userId === userId && e.courseId === courseId
        );

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this course'
            });
        }

        // Create enrollment
        const newEnrollment = {
            id: enrollmentsData.enrollments.length + 1,
            userId,
            courseId,
            progress: 0,
            completed: false,
            enrolledAt: new Date().toISOString()
        };

        enrollmentsData.enrollments.push(newEnrollment);
        saveEnrollments(enrollmentsData);

        res.json({
            success: true,
            message: 'Successfully enrolled in course!',
            enrollment: newEnrollment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error enrolling in course',
            error: error.message
        });
    }
});

// Update Course Progress
app.put('/api/progress/:courseId', (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId);
        const { userId, progress } = req.body;

        if (!userId || progress === undefined) {
            return res.status(400).json({
                success: false,
                message: 'User ID and progress are required'
            });
        }

        const enrollmentsData = loadEnrollments();
        const enrollment = enrollmentsData.enrollments.find(
            e => e.userId === userId && e.courseId === courseId
        );

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Update progress
        enrollment.progress = Math.min(100, Math.max(0, progress));
        enrollment.completed = enrollment.progress === 100;
        enrollment.lastUpdated = new Date().toISOString();

        saveEnrollments(enrollmentsData);

        res.json({
            success: true,
            message: 'Progress updated successfully',
            enrollment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating progress',
            error: error.message
        });
    }
});

// Change Password
app.put('/api/auth/change-password', (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'User ID, current password, and new password are required'
            });
        }

        const usersData = loadUsers();
        const user = usersData.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        if (user.password !== currentPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword; // In production, hash this!
        user.passwordUpdatedAt = new Date().toISOString();

        saveUsers(usersData);

        res.json({
            success: true,
            message: 'Password updated successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🎓 EduLe Backend Server running on http://localhost:${PORT}`);
    console.log(`📚 API endpoints available:`);
    console.log(`   - GET  /api/courses`);
    console.log(`   - GET  /api/courses/:id`);
    console.log(`   - GET  /api/categories`);
    console.log(`   - POST /api/contact`);
    console.log(`   - POST /api/become-instructor`);
    console.log(`   - POST /api/auth/register`);
    console.log(`   - POST /api/auth/login`);
    console.log(`   - GET  /api/auth/profile/:userId`);
    console.log(`   - PUT  /api/auth/change-password`);
    console.log(`   - POST /api/enroll/:courseId`);
    console.log(`   - PUT  /api/progress/:courseId`);
});

