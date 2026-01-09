// This is the address where our backend server lives
const API_BASE_URL = (window.location.protocol === 'file:' || window.location.hostname === '')
    ? 'http://localhost:3000/api'
    : '/api';

// These are helpers to talk to the backend
const API = {
    // Get the list of courses
    // We can also filter them by category or search word
    async getCourses(category = null, search = null) {
        try {
            let url = `${API_BASE_URL}/courses`;
            // Prepare the settings to send
            const params = new URLSearchParams();

            if (category) params.append('category', category);
            if (search) params.append('search', search);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching courses:', error);
            return { success: false, courses: [] };
        }
    },

    // Fetch single course by ID
    async getCourse(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/courses/${id}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching course:', error);
            return { success: false };
        }
    },

    // Fetch all categories
    async getCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { success: false, categories: [] };
        }
    },

    // Submit contact form
    async submitContact(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            // If something goes wrong, just log it and don't crash the app
            console.error('Error submitting contact form:', error);
            return { success: false, message: 'Error submitting form' };
        }
    },

    // Submit instructor application
    async submitInstructorApplication(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/become-instructor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error submitting instructor application:', error);
            return { success: false, message: 'Error submitting application' };
        }
    },

    // Admin Methods
    async getAdminStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/stats`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            return { success: false };
        }
    },

    async getAdminUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching admin users:', error);
            return { success: false, users: [] };
        }
    },

    async getAdminMessages() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/messages?t=${Date.now()}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching admin messages:', error);
            return { success: false, messages: [] };
        }
    },

    async updateAdminMessageStatus(id, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/messages/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating message status:', error);
            return { success: false, message: 'Error updating status' };
        }
    },

    async deleteAdminMessage(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/messages/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting message:', error);
            return { success: false, message: 'Error deleting message' };
        }
    },

    async updateUserRole(userId, isAdmin) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isAdmin })
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating user role:', error);
            return { success: false, message: 'Error updating user role' };
        }
    },

    async addCourse(courseData) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(courseData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding course:', error);
            return { success: false };
        }
    },

    async deleteCourse(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting course:', error);
            return { success: false };
        }
    },

    // Blog Methods
    async getBlogs() {
        try {
            const response = await fetch(`${API_BASE_URL}/blogs`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching blogs:', error);
            return { success: false, blogs: [] };
        }
    },

    async getBlog(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/blogs/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching blog:', error);
            return { success: false };
        }
    }
};

// Utility Functions
const Utils = {
    // Format price in Nepali Rupees
    formatPrice(price) {
        if (price === 0) return 'निःशुल्क';
        return `रू ${price.toLocaleString('ne-NP')}`;
    },

    // Turn a number like 4.5 into stars like ★★★★☆
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        if (hasHalfStar) {
            stars += '☆';
        }
        while (stars.length < 5) {
            stars += '☆';
        }

        return stars;
    },

    // Get course URL
    getCourseUrl(courseId) {
        return `pages/course-detail.html?id=${courseId}`;
    },

    // Get URL parameter
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    // Show loading state
    showLoading(element) {
        element.innerHTML = '<div class="loading">Loading...</div>';
    },

    // Show error message
    showError(element, message) {
        element.innerHTML = `<div class="error-message">${message}</div>`;
    }
};
