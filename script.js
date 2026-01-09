// ===================================
// Mobile Menu Toggle
// ===================================
// ===================================
// Mobile Menu Toggle
// ===================================
// Find the menu buttons and lists on the page
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navActions = document.querySelector('.nav-actions');

if (mobileMenuToggle) {
    // When clicking the menu button, show/hide the menu
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navActions.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// ===================================
// Sticky Header on Scroll
// ===================================
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // If we scrolled down a bit, add a shadow to the header
    if (currentScroll > 100) {
        header.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ===================================
// Search Input Focus Effect
// ===================================
const searchInput = document.querySelector('.search-input');

if (searchInput) {
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.style.transform = 'scale(1.02)';
    });

    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.style.transform = 'scale(1)';
    });
}

// ===================================
// Category Filter
// ===================================
const categoryButtons = document.querySelectorAll('.category-btn');

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        // Add a subtle animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    });
});

// ===================================
// Course Card Interactions
// ===================================
const courseCards = document.querySelectorAll('.course-card');

courseCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.zIndex = '10';
    });

    card.addEventListener('mouseleave', () => {
        card.style.zIndex = '1';
    });
});

// ===================================
// Smooth Scroll for Navigation Links
// ===================================
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                // Scroll to the spot, but leave some space for the header
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===================================
// Intersection Observer for Animations
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Prepare the cards to be animated
// They start invisible and slightly down
courseCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// ===================================
// Add Ripple Effect to Buttons
// ===================================
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple styles dynamically
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===================================
// Console Welcome Message
// ===================================
console.log('%c🎓 Welcome to EduLe!', 'color: #23BD33; font-size: 20px; font-weight: bold;');
console.log('%cStart your learning journey today!', 'color: #666; font-size: 14px;');

// ===================================
// Dynamic Course Loading
// ===================================
let currentCategory = null;
let currentSearch = null;

// Render course card
function renderCourseCard(course) {
    const badgeClass = `badge-${course.badge.toLowerCase()}`;
    const priceHTML = course.price === 0
        ? '<span class="price-current">Free</span>'
        : `
            <span class="price-current">रू ${course.price.toLocaleString('ne-NP')}</span>
            ${course.oldPrice ? `<span class="price-old">रू ${course.oldPrice.toLocaleString('ne-NP')}</span>` : ''}
        `;

    const stars = Utils.generateStars(course.rating);

    return `
        <div class="course-card" data-category="${course.category}">
            <div class="course-image">
                <img src="${course.image}" alt="${course.title}">
            </div>
            <div class="course-content">
                <div class="course-author">
                    <img src="${course.instructorAvatar}" alt="${course.instructor}" class="author-avatar">
                    <span class="author-name">${course.instructor}</span>
                    <span class="course-badge ${badgeClass}">${course.badge}</span>
                </div>
                <h3 class="course-title">${course.title}</h3>
                <div class="course-meta">
                    <div class="course-stats">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L10 6L14 6.5L11 9.5L12 14L8 11.5L4 14L5 9.5L2 6.5L6 6L8 2Z" fill="#FFD700"/>
                        </svg>
                        <span>${course.rating} (${course.grades} Grades)</span>
                    </div>
                    <div class="course-lectures">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="3" width="12" height="10" rx="1" stroke="#666"/>
                            <path d="M7 6L10 8L7 10V6Z" fill="#666"/>
                        </svg>
                        <span>${course.lectures} Lectures</span>
                    </div>
                </div>
                <div class="course-footer">
                    <div class="course-price">
                        ${priceHTML}
                    </div>
                    <div class="course-rating">
                        <span class="stars">${stars}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get the courses from the backend and show them
async function loadCourses(category = null, search = null) {
    const courseGrid = document.querySelector('.course-grid');
    if (!courseGrid) return; // Stop if there is no grid on this page

    // Show "Loading..." text
    courseGrid.innerHTML = '<div class="loading">Courses loading...</div>';

    try {
        const data = await API.getCourses(category, search);

        if (data.success && data.courses.length > 0) {
            courseGrid.innerHTML = data.courses.map(course => renderCourseCard(course)).join('');

            // Re-attach observers for new cards
            const newCards = document.querySelectorAll('.course-card');
            newCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(card);

                // Add click handler to navigate to course detail
                card.addEventListener('click', () => {
                    const courseId = data.courses.find(c => c.title === card.querySelector('.course-title').textContent).id;
                    window.location.href = `pages/course-detail.html?id=${courseId}`;
                });
            });
        } else {
            courseGrid.innerHTML = '<div class="no-results">No courses found</div>';
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        courseGrid.innerHTML = '<div class="error-message">Error loading courses. Please try again.</div>';
    }
}

// Category filter functionality
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        // Get category from button text
        const category = button.textContent.trim();
        currentCategory = category;

        // Load courses for this category
        loadCourses(category, currentSearch);

        // Add a subtle animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    });
});

// Search functionality
if (searchInput) {
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            currentSearch = e.target.value.trim();
            loadCourses(currentCategory, currentSearch);
        }, 500); // Debounce search
    });
}

// ===================================
// Theme Toggle Logic
// ===================================

const themeButtons = document.querySelectorAll('.theme-toggle');

// Function to update UI based on theme
function updateThemeUI(theme) {
    const isDark = theme === 'dark';

    // Toggle body class
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // Toggle icons for all buttons
    themeButtons.forEach(btn => {
        const sunIcon = btn.querySelector('.sun-icon');
        const moonIcon = btn.querySelector('.moon-icon');

        if (sunIcon && moonIcon) {
            if (isDark) {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            } else {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            }
        }
    });

    // Save to local storage
    localStorage.setItem('theme', theme);
}

// Initialize theme
const currentTheme = localStorage.getItem('theme') || 'light';
updateThemeUI(currentTheme);

// Add event listeners
// Add event listeners with safety check
if (themeButtons.length > 0) {
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            const newTheme = isDark ? 'light' : 'dark';
            updateThemeUI(newTheme);
        });
    });
}

console.log('Theme toggle initialized');

// Load courses on page load
if (document.querySelector('.course-grid')) {
    loadCourses();
}
