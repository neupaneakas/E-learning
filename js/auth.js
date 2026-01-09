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
        // Redirect to index.html regardless of which page we are on
        const isSubPage = window.location.pathname.includes('/pages/');
        window.location.href = isSubPage ? '../index.html' : 'index.html';
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

                // Handle Remember Me (Email persistence)
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                return { success: true, user: data.user };
            }
            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login' };
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
        const navMenu = document.querySelector('.nav-menu');

        if (user && navActions) {
            const isSubPage = window.location.pathname.includes('/pages/');
            const profilePath = isSubPage ? 'profile.html' : 'pages/profile.html';
            const dashboardPath = isSubPage ? 'admin.html' : 'pages/admin.html';

            // Add Admin link to main menu if not present
            if (user.isAdmin && navMenu) {
                const existingAdminLink = navMenu.querySelector(`a[href$="admin.html"]`);
                if (!existingAdminLink) {
                    const li = document.createElement('li');
                    li.id = 'dynamic-admin-link';
                    // User Request: Force login page when clicking Admin Dashboard
                    const adminLoginPath = isSubPage ? 'admin-login.html' : 'pages/admin-login.html';
                    li.innerHTML = `<a href="${adminLoginPath}" class="nav-link" style="color: var(--primary-color); font-weight: 700;">Admin Dashboard</a>`;
                    navMenu.appendChild(li);
                }
            } else if (navMenu) {
                const dynamicAdmin = document.getElementById('dynamic-admin-link');
                if (dynamicAdmin) dynamicAdmin.remove();
            }

            // Use profile image if available, otherwise use default SVG
            const avatarHtml = user.profileImage
                ? `<img src="${user.profileImage}" alt="${user.name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`
                : `<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-light); color: var(--primary-color); display: flex; align-items: center; justify-content: center;">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                            <path d="M4 18C4 14.6863 6.68629 12 10 12C13.3137 12 16 14.6863 16 18" stroke="currentColor" stroke-width="2"/>
                        </svg>
                   </div>`;

            // Change the html to show user info (without admin link here)
            navActions.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <a href="${profilePath}" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; font-weight: 500;">
                        ${avatarHtml}
                        <span style="white-space: nowrap;">${user.name}</span>
                    </a>
                    <button onclick="Auth.logout()" class="btn btn-primary btn-sm">Logout</button>
                </div>
            `;
        }
    },

    // Update User Profile
    async updateProfile(profileData) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: 'Not logged in' };

        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();
            if (data.success) {
                // Update local storage user data
                const updatedUser = { ...user, ...data.user };
                this.setCurrentUser(updatedUser, localStorage.getItem('eduLeUser') !== null);
                return { success: true, user: updatedUser };
            }
            return data;
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, message: 'Error updating profile' };
        }
    }
};

// Update navigation on page load
if (typeof document !== 'undefined' && document.querySelector('.nav-actions')) {
    Auth.updateNavigation();
}
