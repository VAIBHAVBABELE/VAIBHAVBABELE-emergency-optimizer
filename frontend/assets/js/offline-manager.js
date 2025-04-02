/**
 * Emergency Supply Optimizer - Offline Manager
 * Handles all offline functionality including:
 * - Caching data locally
 * - Syncing when back online
 * - Queueing offline actions
 */

// Document Ready Handler
$(document).ready(function() {
    loadCachedData();
    setupOfflineEventListeners();
    
    // Check if we're in offline mode
    if ($('body').hasClass('offline-mode')) {
        showOfflineAlert();
    }
});

/**
 * Load cached data from localStorage
 */
function loadCachedData() {
    // Load cached disasters
    const cachedDisasters = JSON.parse(localStorage.getItem('cachedDisasters') || '[]');
    renderCachedDisasters(cachedDisasters);
    
    // Load cached resources
    const cachedResources = JSON.parse(localStorage.getItem('cachedResources') || '{}');
    renderCachedResources(cachedResources);
    
    // Update last sync time
    const lastSync = localStorage.getItem('lastSync');
    if (lastSync) {
        $('#lastSyncTime').text(`Last sync: ${formatTime(lastSync)}`);
    }
}

/**
 * Render cached disasters
 */
function renderCachedDisasters(disasters) {
    let html = '';
    
    if (disasters.length === 0) {
        html = `<div class="alert alert-warning">No cached disaster data available.</div>`;
    } else {
        disasters.forEach(disaster => {
            html += `
                <div class="cached-item">
                    <div class="d-flex justify-content-between">
                        <h6>${disaster.location} ${disaster.type}</h6>
                        <span class="badge ${getSeverityClass(disaster.severity)}">${disaster.severity}</span>
                    </div>
                    <p class="mb-1 small">${disaster.description || 'No additional details'}</p>
                    <div class="d-flex justify-content-between">
                        <small class="timestamp">Cached: ${formatTime(disaster.timestamp)}</small>
                        <button class="btn btn-sm btn-outline-secondary">View Details</button>
                    </div>
                </div>
            `;
        });
    }
    
    $('#cachedDisasters').html(html);
}

/**
 * Render cached resources
 */
function renderCachedResources(resources) {
    // Update progress bars
    if (resources.food) {
        $('#cachedFood')
            .css('width', `${(resources.food.current / resources.food.capacity) * 100}%`)
            .text(`${resources.food.current}/${resources.food.capacity}`);
    }
    
    if (resources.medicine) {
        $('#cachedMeds')
            .css('width', `${(resources.medicine.current / resources.medicine.capacity) * 100}%`)
            .text(`${resources.medicine.current}/${resources.medicine.capacity}`);
    }
    
    if (resources.boats) {
        $('#cachedBoats')
            .css('width', `${(resources.boats.current / resources.boats.capacity) * 100}%`)
            .text(`${resources.boats.current}/${resources.boats.capacity}`);
    }
}

/**
 * Setup offline event listeners
 */
function setupOfflineEventListeners() {
    // Try reconnect button
    $('#tryReconnect').click(tryReconnect);
    
    // Clear cache button
    $('#clearCache').click(function() {
        if (confirm('Are you sure you want to clear all locally cached data?')) {
            clearLocalCache();
        }
    });
    
    // Offline action buttons
    $('.offline-action-card button').click(function() {
        showToast('This action will be queued for sync when online', 'info');
    });
}

/**
 * Attempt to reconnect
 */
function tryReconnect() {
    const btn = $(this);
    btn.html('<i class="fas fa-spinner fa-spin me-2"></i> Connecting...');
    btn.prop('disabled', true);
    
    // Simulate connection attempt
    setTimeout(() => {
        if (navigator.onLine) {
            // Success - sync and redirect
            syncOfflineData();
            window.location.href = '../pages/dashboard.html';
        } else {
            // Failure
            btn.html('<i class="fas fa-wifi-slash me-2"></i> Try to Reconnect');
            btn.prop('disabled', false);
            showToast('Still offline. Please check your connection.', 'danger');
        }
    }, 2000);
}

/**
 * Clear local cache
 */
function clearLocalCache() {
    localStorage.removeItem('cachedDisasters');
    localStorage.removeItem('cachedResources');
    localStorage.removeItem('lastSync');
    localStorage.removeItem('offlineActions');
    
    // Update UI
    $('#cachedDisasters').html('<div class="alert alert-success">Local cache cleared successfully.</div>');
    $('#cachedFood, #cachedMeds, #cachedBoats').css('width', '0%').text('No data');
    $('#lastSyncTime').text('Last sync: Never');
    
    showToast('All local data has been cleared', 'success');
}

/**
 * Sync offline data when back online
 */
function syncOfflineData() {
    // In a real app, this would:
    // 1. Check for queued actions
    // 2. Send them to the server
    // 3. Update local cache
    
    // For prototype, just update timestamp
    const now = new Date();
    localStorage.setItem('lastSync', now.toISOString());
    showToast('Offline data synced successfully', 'success');
}

/**
 * Show offline alert
 */
function showOfflineAlert() {
    const alertHtml = `
        <div class="alert alert-danger mb-4">
            <i class="fas fa-wifi-slash me-2"></i>
            <strong>You are currently offline.</strong> Some features may be unavailable or limited.
        </div>
    `;
    $('#cachedDisasters').before(alertHtml);
}

/**
 * Helper: Format timestamp
 */
function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

/**
 * Helper: Get severity class
 */
function getSeverityClass(severity) {
    const severityClasses = {
        'High': 'bg-danger',
        'Medium': 'bg-warning',
        'Low': 'bg-success'
    };
    return severityClasses[severity] || 'bg-secondary';
}

/**
 * Helper: Show toast notification (from shared app.js)
 */
function showToast(message, type) {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        // Fallback if shared function not available
        alert(`${type.toUpperCase()}: ${message}`);
    }
}