// Authentication Module
const Auth = {
    // Check if we know who the user is
    // First look in "Remember Me" storage, then look in temporary storage
    getCurrentUser() {
        // Check permanent storage
        let userStr = localStorage.getItem('eduLeUser');
        if (userStr) return JSON.parse(userStr);

        // Check temporary storage
        userStr = sessionStorage.getItem('eduLeUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Set current user in localStorage or sessionStorage
    setCurrentUser(user, rememberMe = false) {
        const userJson = JSON.stringify(user);

        if (rememberMe) {
            // Store in localStorage for persistent login
            localStorage.setItem('eduLeUser', userJson);
            // Remove from sessionStorage if exists
            sessionStorage.removeItem('eduLeUser');
        } else {
            // Store in sessionStorage for session-only login
            sessionStorage.setItem('eduLeUser', userJson);
            // Remove from localStorage if exists
            localStorage.removeItem('eduLeUser');
        }
    },

    // Remove current user (logout)
    logout() {
        localStorage.removeItem('eduLeUser');
        sessionStorage.removeItem('eduLeUser');
        window.location.href = '/index.html';
    },

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // Register new user
    async register(name, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Error during registration' };
        }
    },

    // Login user
    async login(email, password, rememberMe = false) {
        try {
            // Ask the server to log us in
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.setCurrentUser(data.user, rememberMe);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Error during login' };
        }
    },

    // Get user profile
    async getProfile(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return { success: false };
        }
    },

    // Enroll in course
    async enrollCourse(courseId) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, message: 'Please login first' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/enroll/${courseId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user.id })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Enrollment error:', error);
            return { success: false, message: 'Error enrolling in course' };
        }
    },

    // Update course progress
    async updateProgress(courseId, progress) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, message: 'Please login first' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/progress/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user.id, progress })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Progress update error:', error);
            return { success: false, message: 'Error updating progress' };
        }
    },

    // Change Password
    async changePassword(currentPassword, newPassword) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, message: 'Please login first' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Password change error:', error);
            return { success: false, message: 'Error changing password' };
        }
    },

    // Fix the top menu
    // If logged in: Show Name and Logout button
    // If not logged in: Keep the Sign In button
    updateNavigation() {
        const user = this.getCurrentUser();
        const navActions = document.querySelector('.nav-actions');

        if (user && navActions) {
            // Change the html to show user info
            navActions.innerHTML = `
                <a href="pages/profile.html" class="btn-text">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="vertical-align: middle; margin-right: 4px;">
                        <circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                        <path d="M4 18C4 14.6863 6.68629 12 10 12C13.3137 12 16 14.6863 16 18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    ${user.name}
                </a>
                <button onclick="Auth.logout()" class="btn btn-primary">Logout</button>
            `;
        }
    }
};

// Update navigation on page load
if (document.querySelector('.nav-actions')) {
    Auth.updateNavigation();
}
