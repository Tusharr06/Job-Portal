// Auth State
let currentUser = null;
let isAdmin = false;

// DOM Elements
const authModal = document.getElementById('authModal');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const usernameSpan = document.getElementById('username');
const logoutBtn = document.getElementById('logoutBtn');
const adminElements = document.querySelectorAll('.admin-only');

// Admin credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@jobconnect.pro',
    password: 'admin123',
    name: 'Admin'
};

// Event Listeners
document.addEventListener('DOMContentLoaded', initAuth);
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
logoutBtn.addEventListener('click', handleLogout);

// Auth tab switching
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        
        // Update active tab
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show active form
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${tabId}Form`) {
                form.classList.add('active');
            }
        });
    });
});

// Initialize Authentication
function initAuth() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        handleAuthSuccess(user);
    } else {
        showAuthModal();
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginType = document.querySelector('input[name="loginType"]:checked').value;
    
    try {
        // Admin login check
        if (loginType === 'admin') {
            if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
                const adminUser = {
                    name: ADMIN_CREDENTIALS.name,
                    email: ADMIN_CREDENTIALS.email,
                    isAdmin: true
                };
                handleAuthSuccess(adminUser);
                showToast('Welcome back, Admin!', 'success');
                return;
            } else {
                showToast('Invalid admin credentials', 'error');
                return;
            }
        }
        
        // Regular user login
        const userDoc = await db.collection('users')
            .where('email', '==', email)
            .where('password', '==', password)
            .get();
        
        if (!userDoc.empty) {
            const userData = {
                id: userDoc.docs[0].id,
                ...userDoc.docs[0].data(),
                isAdmin: false
            };
            handleAuthSuccess(userData);
            showToast('Login successful!', 'success');
        } else {
            showToast('Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Error during login', 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        // Check if user already exists
        const existingUser = await db.collection('users')
            .where('email', '==', email)
            .get();
        
        if (!existingUser.empty) {
            showToast('Email already registered', 'error');
            return;
        }
        
        // Create new user
        const userRef = await db.collection('users').add({
            name,
            email,
            password,
            createdAt: firebase.firestore.Timestamp.now()
        });
        
        const userData = {
            id: userRef.id,
            name,
            email,
            isAdmin: false
        };
        
        handleAuthSuccess(userData);
        showToast('Registration successful!', 'success');
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Error during registration', 'error');
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    isAdmin = false;
    showAuthModal();
    showToast('Logged out successfully', 'success');
}

// Handle Authentication Success
function handleAuthSuccess(user) {
    currentUser = user;
    isAdmin = user.isAdmin;
    
    // Save user data
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Update UI
    usernameSpan.textContent = user.name;
    
    // Show/hide admin features
    adminElements.forEach(el => {
        el.style.display = isAdmin ? 'block' : 'none';
    });
    
    // Hide auth modal and show app
    hideAuthModal();
    showApp();
}

// Show/Hide Modals
function showAuthModal() {
    authModal.style.display = 'block';
    appContainer.classList.add('hidden');
}

function hideAuthModal() {
    authModal.style.display = 'none';
    loginForm.reset();
    registerForm.reset();
}

function showApp() {
    appContainer.classList.remove('hidden');
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'error' ? 'fa-exclamation-circle' : 
                          'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}