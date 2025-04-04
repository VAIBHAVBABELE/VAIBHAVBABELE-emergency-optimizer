/**
 * Emergency Supply Optimizer - Clean Main Application Script
 * Without severity indicators and toast notifications
 */

// Global variable to store simulated disasters
window.simulatedDisasters = [];

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
    
    // Delegate click handler for view details buttons
    $('#alertsContainer').on('click', '.view-details-btn', function() {
        const disasterId = $(this).data('disaster-id');
        viewDisasterDetails(disasterId);
    });
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
    }
}

/**
 * Handle network status changes
 */
function handleNetworkStatusChange() {
    checkNetworkStatus();
    if (navigator.onLine) {
        syncOfflineData();
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
    }
}

/**
 * Load initial data with sample disasters
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
    
    // Simulate loading time
    setTimeout(() => {
        // Create 3 sample disasters
        const sampleDisasters = [
            createDisaster('flood', 'Assam'),
            createDisaster('earthquake', 'Gujarat'),
            createDisaster('cyclone', 'Kerala')
        ];
        
        // Store sample disasters
        window.simulatedDisasters = sampleDisasters;
        
        // Render them
        renderDisasterList(sampleDisasters);
        
        // Load predictions
        loadPredictionSummary();
    }, 800);
}

/**
 * Create a disaster object with comprehensive data
 */
function createDisaster(type, location) {
    const disasterTypes = {
        flood: { icon: 'fa-water', color: 'info' },
        earthquake: { icon: 'fa-hill-rockslide', color: 'danger' },
        cyclone: { icon: 'fa-wind', color: 'warning' },
        wildfire: { icon: 'fa-fire', color: 'danger' }
    };
    
    const locations = {
        Assam: { coordinates: [26.2006, 92.9376], population: 35607000 },
        Bihar: { coordinates: [25.0961, 85.3131], population: 124799926 },
        Gujarat: { coordinates: [22.2587, 71.1924], population: 63872399 },
        Kerala: { coordinates: [10.8505, 76.2711], population: 35699443 }
    };
    
    const disasterId = 'disaster-' + Date.now() + Math.floor(Math.random() * 1000);
    const affectedAreas = Math.floor(Math.random() * 50) + 5;
    const casualties = Math.floor(Math.random() * 50);
    
    return {
        id: disasterId,
        type: type,
        icon: disasterTypes[type].icon,
        color: disasterTypes[type].color,
        location: location,
        coordinates: locations[location].coordinates,
        population: locations[location].population,
        timestamp: new Date().toISOString(),
        details: `A ${type} has been reported in ${location}. Emergency teams are assessing the situation.`,
        affectedAreas: affectedAreas,
        estimatedAffected: Math.floor(affectedAreas * 5000),
        casualties: casualties,
        injuries: casualties * 3,
        displaced: Math.floor(affectedAreas * 1000),
        status: 'Active',
        resourcesNeeded: {
            food: affectedAreas * 200,
            water: affectedAreas * 300,
            medicine: affectedAreas * 50,
            tents: affectedAreas * 20
        }
    };
}

/**
 * Render list of disasters
 */
function renderDisasterList(disasters) {
    if (disasters.length === 0) {
        $('#alertsContainer').html(`
            <div class="text-center py-5">
                <i class="fas fa-info-circle fa-2x text-muted mb-3"></i>
                <p>No active disasters found</p>
            </div>
        `);
        return;
    }
    
    let alertsHtml = '';
    disasters.forEach(disaster => {
        alertsHtml += `
            <div class="alert-item ${disaster.type}" data-disaster-id="${disaster.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas ${disaster.icon} me-2 text-${disaster.color}"></i>
                        <strong>${disaster.location} ${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}</strong>
                    </div>
                </div>
                <div class="disaster-stats mt-2">
                    <span class="badge bg-secondary me-2">
                        <i class="fas fa-map-marker-alt me-1"></i> ${disaster.affectedAreas} areas
                    </span>
                    <span class="badge bg-danger me-2">
                        <i class="fas fa-user-injured me-1"></i> ${disaster.casualties} casualties
                    </span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <small class="text-muted">${new Date(disaster.timestamp).toLocaleTimeString()}</small>
                    <button class="btn btn-sm btn-outline-primary view-details-btn" data-disaster-id="${disaster.id}">
                        <i class="fas fa-info-circle me-1"></i> View Details
                    </button>
                </div>
            </div>
        `;
    });
    
    $('#alertsContainer').html(alertsHtml);
}

/**
 * Simulate a disaster
 */
function simulateDisaster() {
    const disasterTypes = ['flood', 'earthquake', 'cyclone', 'wildfire'];
    const locations = ['Assam', 'Bihar', 'Gujarat', 'Kerala'];
    
    const randomType = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    const disaster = createDisaster(randomType, randomLocation);
    window.simulatedDisasters.unshift(disaster); // Add to beginning of array
    
    renderDisasterList(window.simulatedDisasters);
    
    // Show on map if available
    if (window.addDisasterToMap) {
        window.addDisasterToMap(disaster);
    }
}

/**
 * View disaster details in modal
 */
function viewDisasterDetails(disasterId) {
    const disaster = window.simulatedDisasters.find(d => d.id === disasterId);
    if (!disaster) return;
    
    // Format resources needed
    const resourcesHtml = Object.entries(disaster.resourcesNeeded)
        .map(([resource, amount]) => `
            <div class="col-6 col-md-3 mb-2">
                <div class="card h-100">
                    <div class="card-body p-2 text-center">
                        <div class="text-${resource === 'food' ? 'success' : resource === 'water' ? 'primary' : resource === 'medicine' ? 'danger' : 'warning'}">
                            <i class="fas ${resource === 'food' ? 'fa-bread-slice' : resource === 'water' ? 'fa-tint' : resource === 'medicine' ? 'fa-pills' : 'fa-campground'} fa-2x mb-2"></i>
                            <h6 class="mb-0">${amount.toLocaleString()}</h6>
                            <small>${resource.charAt(0).toUpperCase() + resource.slice(1)}</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    
    // Create modal HTML
    const modalHtml = `
        <div class="modal fade" id="disasterModal" tabindex="-1" aria-labelledby="disasterModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="disasterModalLabel">
                            <i class="fas ${disaster.icon} me-2"></i>
                            ${disaster.location} ${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="mb-3">
                                                    <h6 class="text-muted">Location</h6>
                                                    <p>${disaster.location}</p>
                                                </div>
                                                <div class="mb-3">
                                                    <h6 class="text-muted">Type</h6>
                                                    <p>${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}</p>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="mb-3">
                                                    <h6 class="text-muted">Time Detected</h6>
                                                    <p>${new Date(disaster.timestamp).toLocaleString()}</p>
                                                </div>
                                                <div class="mb-3">
                                                    <h6 class="text-muted">Status</h6>
                                                    <p>${disaster.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="mb-3">
                                                    <h6 class="text-muted">Affected Areas</h6>
                                                    <p>${disaster.affectedAreas}</p>
                                                </div>
                                                <div class="mb-3">
                                                    <h6 class="text-muted">Estimated Affected</h6>
                                                    <p>${disaster.estimatedAffected.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="mb-3">
                                                    <h6 class="text-muted">Casualties</h6>
                                                    <p>${disaster.casualties}</p>
                                                </div>
                                                <div class="mb-3">
                                                    <h6 class="text-muted">Displaced</h6>
                                                    <p>${disaster.displaced.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <h5 class="mb-3">Resources Needed</h5>
                        <div class="row g-2 mb-4">
                            ${resourcesHtml}
                        </div>
                        
                        <h5 class="mb-3">Location</h5>
                        <div id="mapPreview" style="height: 250px; background-color: #f8f9fa; border-radius: 5px;" 
                            data-lat="${disaster.coordinates[0]}" 
                            data-lng="${disaster.coordinates[1]}"
                            data-title="${disaster.location} ${disaster.type}">
                            <div class="h-100 d-flex justify-content-center align-items-center">
                                <div class="text-center">
                                    <i class="fas fa-map-marked-alt fa-2x text-muted mb-2"></i>
                                    <p class="mb-0">Map preview</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-primary mt-4">
                            <h6><i class="fas fa-info-circle me-2"></i>Details</h6>
                            <p class="mb-0">${disaster.details}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary">
                            <i class="fas fa-paper-plane me-1"></i> Dispatch Resources
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Append modal to body and show it
    $('body').append(modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('disasterModal'));
    modal.show();
    
    // Remove modal when hidden
    $('#disasterModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

/**
 * Refresh all data
 */
function refreshData() {
    // Show loading indicator
    const btn = $(this);
    const originalText = btn.html();
    btn.html('<i class="fas fa-spinner fa-spin me-2"></i> Refreshing...');
    btn.prop('disabled', true);
    
    // Simulate data refresh
    setTimeout(() => {
        loadInitialData();
        btn.html(originalText);
        btn.prop('disabled', false);
    }, 1000);
}

/**
 * View offline data
 */
function viewOfflineData() {
    // No action needed - just showing the cached data
}

/**
 * View full predictions report
 */
function viewFullPredictions() {
    window.location.href = 'prediction.html';
}

/**
 * Set application language
 */
function setLanguage(lang) {
    $('[data-lang]').removeClass('active');
    $(`[data-lang="${lang}"]`).addClass('active');
}

// Initialize other modules (these would be in separate files)
function initMap() {
    // Map initialization handled in map-loader.js
    console.log('Map initialization would happen here');
}

function initPredictions() {
    // Predictions initialization handled in prediction-api.js
    console.log('Predictions initialization would happen here');
}

function loadDisasters() {
    // Disaster loading handled in map-loader.js
    console.log('Disaster loading would happen here');
}

function loadPredictionSummary() {
    // Prediction loading handled in prediction-api.js
    console.log('Prediction summary loading would happen here');
}

function syncOfflineData() {
    // Offline sync handled in offline-manager.js
    console.log('Offline data sync would happen here');
}