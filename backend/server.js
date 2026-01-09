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

// Helper to read course data from the file
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

// Helper to read/write messages
const loadMessages = () => {
    const dataPath = path.join(__dirname, '../data/messages.json');
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { messages: [] };
    }
};

const saveMessages = (data) => {
    const dataPath = path.join(__dirname, '../data/messages.json');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Instructor registration
app.post('/api/become-instructor', (req, res) => {
    try {
        const { name, email, phone, expertise, experience, message } = req.body;

        const messagesData = loadMessages();
        const newMessage = {
            id: messagesData.messages.length + 1,
            type: 'instructor_request',
            name,
            email,
            phone,
            expertise,
            experience,
            message,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        messagesData.messages.push(newMessage);
        saveMessages(messagesData);

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

// Get Instructor Messages (Admin)
app.get('/api/admin/messages', (req, res) => {
    try {
        const messagesData = loadMessages();
        res.json({
            success: true,
            messages: messagesData.messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
});

// Update Message Status
app.put('/api/admin/messages/:id/status', (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const { status } = req.body;
        const messagesData = loadMessages();

        const message = messagesData.messages.find(m => m.id === messageId);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        message.status = status;
        saveMessages(messagesData);

        res.json({ success: true, message: `Application ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating status' });
    }
});

// Delete Message
app.delete('/api/admin/messages/:id', (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const messagesData = loadMessages();

        const initialLength = messagesData.messages.length;
        messagesData.messages = messagesData.messages.filter(m => m.id !== messageId);

        if (messagesData.messages.length === initialLength) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        saveMessages(messagesData);
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting message' });
    }
});

// ===================================
// Authentication Endpoints
// ===================================

// Helpers to read/write user data
// In a big app, we would use a real database here
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

const blogsFile = path.join(__dirname, '../data/blogs.json');

// Helper function to read data from JSON files
const readData = (file, defaultContent = {}) => {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist or is invalid JSON, return default content
        return defaultContent;
    }
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
                message: 'This email is already taken'
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
                email: newUser.email,
                isAdmin: false,
                profileImage: null
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
                email: user.email,
                isAdmin: user.isAdmin || false,
                profileImage: user.profileImage || null
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
                createdAt: user.createdAt,
                isAdmin: user.isAdmin || false,
                profileImage: user.profileImage || null
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
});// Enroll in Course
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

// Update User Profile
app.put('/api/auth/profile/:userId', (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { name, profileImage } = req.body;

        const usersData = loadUsers();
        const user = usersData.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (name) user.name = name;
        if (profileImage !== undefined) user.profileImage = profileImage;

        saveUsers(usersData);

        res.json({
            success: true,
            message: 'Profile updated successfully!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin || false,
                profileImage: user.profileImage || null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

// Admin endpoints
app.get('/api/admin/stats', (req, res) => {
    try {
        const usersData = loadUsers();
        const coursesData = loadCourses();
        const enrollmentsData = loadEnrollments();

        res.json({
            success: true,
            stats: {
                totalUsers: usersData.users.length,
                totalCourses: coursesData.courses.length,
                totalEnrollments: enrollmentsData.enrollments.length,
                totalInstructors: new Set(coursesData.courses.map(c => c.instructor)).size
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching admin stats'
        });
    }
});

app.get('/api/admin/users', (req, res) => {
    try {
        const usersData = loadUsers();
        const sanitizedUsers = usersData.users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            isAdmin: u.isAdmin,
            createdAt: u.createdAt
        }));

        res.json({
            success: true,
            users: sanitizedUsers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// Update User Role
app.put('/api/admin/users/:userId/role', (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { isAdmin } = req.body;

        const usersData = loadUsers();
        const user = usersData.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isAdmin = isAdmin;
        saveUsers(usersData);

        res.json({
            success: true,
            message: `User role updated to ${isAdmin ? 'Admin' : 'Student'}`,
            user: {
                id: user.id,
                name: user.name,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user role'
        });
    }
});

// Add Course
app.post('/api/admin/courses', (req, res) => {
    try {
        const coursesData = loadCourses();
        const newCourse = {
            id: coursesData.courses.length + 1,
            ...req.body,
            createdAt: new Date().toISOString()
        };

        coursesData.courses.push(newCourse);
        const dataPath = path.join(__dirname, '../data/courses.json');
        fs.writeFileSync(dataPath, JSON.stringify(coursesData, null, 2));

        res.json({
            success: true,
            message: 'Course added successfully!',
            course: newCourse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding course'
        });
    }
});

// Delete Course
app.delete('/api/admin/courses/:id', (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const coursesData = loadCourses();

        const initialLength = coursesData.courses.length;
        coursesData.courses = coursesData.courses.filter(c => c.id !== courseId);

        if (coursesData.courses.length === initialLength) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const dataPath = path.join(__dirname, '../data/courses.json');
        fs.writeFileSync(dataPath, JSON.stringify(coursesData, null, 2));

        res.json({
            success: true,
            message: 'Course deleted successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting course'
        });
    }
});

// --- Blog Endpoints ---
app.get('/api/blogs', (req, res) => {
    const data = readData(blogsFile, { blogs: [] });
    res.json({ success: true, blogs: data.blogs });
});

app.get('/api/blogs/:id', (req, res) => {
    const data = readData(blogsFile, { blogs: [] });
    const blog = data.blogs.find(b => b.id === parseInt(req.params.id));
    if (blog) {
        res.json({ success: true, blog });
    } else {
        res.status(404).json({ success: false, message: 'Blog not found' });
    }
});

// Export for Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🎓 EduLe Backend Server running on http://localhost:${PORT}`);
        console.log(`📚 API endpoints available:`);
        console.log(`   - GET  /api/blogs`);
        console.log(`   - GET  /api/blogs/:id`);
        console.log(`   - GET  /api/courses`);
        console.log(`   - GET  /api/courses/:id`);
        console.log(`   - GET  /api/categories`);
        console.log(`   - POST /api/contact`);
        console.log(`   - POST /api/become-instructor`);
        console.log(`   - POST /api/auth/register`);
        console.log(`   - POST /api/auth/login`);
        console.log(`   - GET  /api/auth/profile/:userId`);
        console.log(`   - PUT  /api/auth/profile/:userId`);
        console.log(`   - PUT  /api/auth/change-password`);
        console.log(`   - POST /api/enroll/:courseId`);
        console.log(`   - PUT  /api/progress/:courseId`);
        console.log(`   - GET  /api/admin/stats`);
        console.log(`   - GET  /api/admin/users`);
        console.log(`   - POST /api/admin/courses`);
        console.log(`   - DELETE /api/admin/courses/:id`);
        console.log(`   - PUT  /api/admin/users/:userId/role`);
        console.log(`   - GET  /api/admin/messages`);
    });
}

module.exports = app;

