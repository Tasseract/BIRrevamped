// Smooth scroll for in-page anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// IntersectionObserver setup for feature reveals (single observer used)
const featureItems = Array.from(document.querySelectorAll('.feature-item'));
featureItems.forEach((el, i) => el.style.transitionDelay = `${i * 80}ms`);
const featureObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
featureItems.forEach(item => featureObserver.observe(item));

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authButtons = document.querySelector('.auth-buttons');
    const userProfile = document.querySelector('.user-profile');
    const userNameEl = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const registerForm = document.getElementById('register-business-form');

    // --- Signup handler ---
    if (signupForm) {
        console.log('Signup form found.');
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Signup form submitted.');

            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                tin: document.getElementById('tin').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
            };

            console.log('Form data collected:', formData);

            try {
                const response = await fetch(`${API_BASE}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const result = await response.json();
                console.log('Server response:', result);
                alert(result.message);
                if (response.ok) {
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('Error during signup fetch:', error);
                alert('An error occurred. Please check the console for details.');
            }
        });
    }

    // --- Login handler ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Login form submitted.');

            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
            };

            console.log('Sending login data:', formData);

            try {
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const result = await response.json();
                console.log('Server response:', result);
                alert(result.message);
                if (response.ok) {
                    // Store minimal user info and redirect to dashboard
                    localStorage.setItem('user', JSON.stringify(result.user));
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                console.error('Error during login fetch:', error);
                alert('An error occurred. Please check the console for details.');
            }
        });
    }

    // --- Auth state on page load ---
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && userProfile && userNameEl) {
        userNameEl.textContent = `Welcome, ${user.firstName}`;
        userProfile.style.display = 'flex';
        if (authButtons) authButtons.style.display = 'none';
    } else {
        if (userProfile) userProfile.style.display = 'none';
        if (authButtons) authButtons.style.display = 'flex';
    }

    // Dashboard CTA behavior on index
    const dashboardCta = document.getElementById('dashboard-cta');
    if (dashboardCta) {
        if (user) {
            dashboardCta.setAttribute('href','dashboard.html');
        } else {
            dashboardCta.setAttribute('href','login.html');
        }
        // also handle click to route programmatically (ensures consistent behavior)
        dashboardCta.addEventListener('click', (e)=>{
            // allow normal navigation, but ensure redirect path is correct
            const u = JSON.parse(localStorage.getItem('user'));
            if (u) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    // --- Logout ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            alert('You have been logged out.');
            window.location.reload();
        });
    }

    // --- Register Business handler ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user) {
                alert('Please log in first.');
                window.location.href = 'login.html';
                return;
            }

            const payload = {
                name: document.getElementById('biz-name').value.trim(),
                tin: document.getElementById('biz-tin').value.trim(),
                type: document.getElementById('biz-type').value.trim(),
                address: document.getElementById('biz-address').value.trim(),
                contact: document.getElementById('biz-contact').value.trim(),
                ownerId: user.id
            };

            try {
                const res = await fetch(`${API_BASE}/business/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const body = await res.json();
                if (!res.ok) throw new Error(body.message || 'Registration failed');
                alert(body.message || 'Business registered');
                window.location.href = 'dashboard.html';
            } catch (err) {
                console.error(err);
                alert(err.message || 'Error registering business. Check console.');
            }
        });
    }
});

// Simulation and transaction server communication functions
async function saveSimulationToServer(sim) {
  // sim: { title, form, data, amount, userId, businessId? }
    const res = await fetch(`${API_BASE}/api/simulations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sim),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Failed to save simulation');
  }
  return res.json();
}

async function loadSimulationsFromServer(userId) {
    const url = new URL(`${API_BASE}/api/simulations`);
  if (userId) url.searchParams.set('userId', userId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to load simulations');
  return res.json();
}

async function updateSimulationOnServer(id, updates) {
    const res = await fetch(`${API_BASE}/api/simulations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update simulation');
  return res.json();
}

async function createTransactionOnServer({ userId, items, total }) {
    const res = await fetch(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, items, total }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Failed to create transaction');
  }
  return res.json();
}

async function loadTransactionsFromServer(userId) {
    const url = new URL(`${API_BASE}/api/transactions`);
  if (userId) url.searchParams.set('userId', userId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to load transactions');
  return res.json();
}