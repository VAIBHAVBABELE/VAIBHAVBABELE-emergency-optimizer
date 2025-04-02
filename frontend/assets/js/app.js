/**
 * Emergency Supply Optimizer - Main Application Script
 * Handles core functionality, event listeners, and coordination between modules
 */

// Document Ready Handler
$(document).ready(function() {
    // Initialize all modules
    initApplication();
});

/**
 * Initialize the application
 */
function initApplication() {
    // Set up event listeners
    setupEventListeners();
    
    // Check online status
    checkNetworkStatus();
    
    // Load initial data
    loadInitialData();
    
    // Initialize other modules
    initMap();
    initPredictions();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Offline mode toggle
    $('#offlineToggle').click(toggleOfflineMode);
    
    // Language toggle
    $('[data-lang]').click(function() {
        const lang = $(this).data('lang');
        setLanguage(lang);
    });
    
    // Simulate disaster button
    $('#simulateDisaster').click(simulateDisaster);
    
    // Refresh data button
    $('#refreshData').click(refreshData);
    
    // View offline data button
    $('#viewOfflineData').click(viewOfflineData);
    
    // View full predictions button
    $('#viewFullPredictions').click(viewFullPredictions);
    
    // Online/offline event listeners
    window.addEventListener('online', handleNetworkStatusChange);
    window.addEventListener('offline', handleNetworkStatusChange);
}

/**
 * Check and display network status
 */
function checkNetworkStatus() {
    if (navigator.onLine) {
        $('body').removeClass('offline-mode');
        $('#offlineToggle').html('<i class="fas fa-wifi"></i> Online Mode');
    } else {
        $('body').addClass('offline-mode');
        $('#offlineToggle').html('<i class="fas fa-wifi-slash"></i> Offline Mode');
        showOfflineAlert();
    }
}

/**
 * Handle network status changes
 */
function handleNetworkStatusChange() {
    checkNetworkStatus();
    if (navigator.onLine) {
        syncOfflineData();
        // Remove offline indicator if viewing offline page
        if (window.location.pathname.includes('offline.html')) {
            $('body').removeClass('offline-mode');
        }
    } else {
        // Redirect to offline page if connection drops
        if (!window.location.pathname.includes('offline.html')) {
            window.location.href = 'pages/offline.html';
        }
    }
}

/**
 * Toggle offline mode
 */
function toggleOfflineMode() {
    if ($('body').hasClass('offline-mode')) {
        // Switching to online
        $('body').removeClass('offline-mode');
        $(this).html('<i class="fas fa-wifi"></i> Online Mode');
        syncOfflineData();
    } else {
        // Switching to offline
        $('body').addClass('offline-mode');
        $(this).html('<i class="fas fa-wifi-slash"></i> Offline Mode');
        showOfflineAlert();
    }
}

/**
 * Show offline alert
 */
function showOfflineAlert() {
    const alertHtml = `
        <div class="offline-mode">
            <i class="fas fa-wifi-slash me-2"></i>
            You are currently offline. Working with cached data.
        </div>
    `;
    $('body').append(alertHtml);
    setTimeout(() => $('.offline-mode').fadeOut(3000), 5000);
}

/**
 * Load initial data
 */
function loadInitialData() {
    // Show loading state
    $('#alertsContainer').html(`
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);
    
    // Load disasters data
    loadDisasters();
    
    // Load predictions
    loadPredictionSummary();
}

/**
 * Simulate a disaster (demo mode)
 */
function simulateDisaster() {
    // In a real app, this would call your API
    const disasterTypes = ['flood', 'earthquake', 'cyclone'];
    const locations = ['Assam', 'Bihar', 'Gujarat', 'Kerala'];
    
    const randomType = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomSeverity = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
    
    const alertHtml = `
        <div class="alert-item ${randomType}">
            <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0">${randomLocation} ${randomType.charAt(0).toUpperCase() + randomType.slice(1)}</h6>
                <span class="badge bg-${randomSeverity === 'High' ? 'danger' : randomSeverity === 'Medium' ? 'warning' : 'success'}">${randomSeverity}</span>
            </div>
            <p class="small mb-1">New alert detected in ${randomLocation} district</p>
            <button class="btn btn-sm btn-outline-primary">View Details</button>
        </div>
    `;
    
    $('#alertsContainer').prepend(alertHtml);
    
    // Show success message
    const toastHtml = `
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-success text-white">
                    <strong class="me-auto">Simulation Started</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${randomSeverity} severity ${randomType} simulated in ${randomLocation}.
                </div>
            </div>
        </div>
    `;
    
    $('body').append(toastHtml);
    setTimeout(() => $('.toast').toast('hide'), 3000);
}

/**
 * Refresh all data
 */
function refreshData() {
    loadDisasters();
    loadPredictionSummary();
    
    // Show loading indicator
    const btn = $(this);
    btn.html('<i class="fas fa-spinner fa-spin me-2"></i> Refreshing...');
    btn.prop('disabled', true);
    
    setTimeout(() => {
        btn.html('<i class="fas fa-sync-alt me-2"></i> Refresh Data');
        btn.prop('disabled', false);
        
        // Show success toast
        showToast('Data refreshed successfully', 'success');
    }, 1500);
}

/**
 * View offline data
 */
function viewOfflineData() {
    // In a real app, this would show cached data from IndexedDB/SQLite
    showToast('Showing cached offline data', 'info');
}

/**
 * View full predictions report
 */
function viewFullPredictions() {
    // In a real app, this would navigate to predictions page
    showToast('Opening full predictions report', 'info');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const typeClass = {
        'info': 'bg-info',
        'success': 'bg-success',
        'warning': 'bg-warning',
        'danger': 'bg-danger'
    }[type];
    
    const toastHtml = `
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header ${typeClass} text-white">
                    <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        </div>
    `;
    
    $('body').append(toastHtml);
    setTimeout(() => $('.toast').toast('hide'), 3000);
}

/**
 * Set application language
 */
function setLanguage(lang) {
    // In a real app, this would load translations
    $('[data-lang]').removeClass('active');
    $(`[data-lang="${lang}"]`).addClass('active');
    showToast(`Language set to ${lang === 'en' ? 'English' : 'Hindi'}`, 'info');
}

// Initialize other modules (these would be in separate files)
function initMap() {
    // Map initialization handled in map-loader.js
}

function initPredictions() {
    // Predictions initialization handled in prediction-api.js
}

function loadDisasters() {
    // Disaster loading handled in map-loader.js
}

function loadPredictionSummary() {
    // Prediction loading handled in prediction-api.js
}

function syncOfflineData() {
    // Offline sync handled in offline-manager.js
}

// assets/js/app.js
class AuthService {
    static async login(username, password) {
        const response = await fetch('/backend/api/auth.php?action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }
        
        return await response.json();
    }

    static async logout() {
        const response = await fetch('/backend/api/auth.php?action=logout', {
            method: 'POST'
        });
        return await response.json();
    }

    static getToken() {
        return localStorage.getItem('authToken');
    }

    static setToken(token) {
        localStorage.setItem('authToken', token);
    }

    static isAuthenticated() {
        return !!this.getToken();
    }
}

/**
 * Main Application Script
 */

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check authentication
    if (!localStorage.getItem('authToken')) {
        redirectToLogin();
        return;
    }

    // 2. Load and render disasters
    try {
        const disasters = await DisasterService.getAll();
        renderDisasterMap(disasters);
        renderDisasterList(disasters);
    } catch (error) {
        showError('Failed to load disasters', error);
    }

    // 3. Set up event listeners
    document.getElementById('btn-add-disaster')
        .addEventListener('click', handleNewDisaster);
});

// Example rendering function
function renderDisasterList(disasters) {
    const container = document.getElementById('disasters-container');
    container.innerHTML = disasters.map(disaster => `
        <div class="disaster-card" data-id="${disaster.id}">
            <h3>${disaster.type} (Severity: ${disaster.severity})</h3>
            <p>${disaster.location}</p>
            <button class="btn-delete" data-id="${disaster.id}">Archive</button>
        </div>
    `).join('');

    // Add delete handlers
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('Archive this disaster?')) {
                await DisasterService.delete(e.target.dataset.id);
                e.target.closest('.disaster-card').remove();
            }
        });
    });
}

// Example form handler
async function handleNewDisaster() {
    const formData = {
        type: document.getElementById('type').value,
        location: document.getElementById('location').value,
        severity: document.getElementById('severity').value
    };

    try {
        const newDisaster = await DisasterService.create(formData);
        appendDisasterToUI(newDisaster);
    } catch (error) {
        showError('Creation failed', error);
    }
}