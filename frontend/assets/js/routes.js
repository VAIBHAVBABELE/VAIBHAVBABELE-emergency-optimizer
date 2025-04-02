/**
 * Emergency Supply Optimizer - Route Optimization Module
 * Handles:
 * - Route calculation between warehouses and disaster zones
 * - Hazard avoidance
 * - Transport mode selection
 */

// Global variables
let routeMap;
let routingControl;
let currentRoute;

// Document Ready Handler
$(document).ready(function() {
    initRouteMap();
    setupRouteEventListeners();
});

/**
 * Initialize the route map
 */
function initRouteMap() {
    // Center on India
    routeMap = L.map('routeMap').setView([20.5937, 78.9629], 5);
    
    // Add base map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(routeMap);
    
    // Add scale control
    L.control.scale().addTo(routeMap);
}

/**
 * Set up event listeners
 */
function setupRouteEventListeners() {
    // Route form submission
    $('#routeForm').submit(function(e) {
        e.preventDefault();
        calculateOptimalRoute();
    });
    
    // Hazard avoidance button
    $('#avoidHazards').click(toggleHazardAvoidance);
    
    // Map controls
    $('#zoomIn').click(() => routeMap.zoomIn());
    $('#zoomOut').click(() => routeMap.zoomOut());
    $('#printRoute').click(printRoute);
}

/**
 * Calculate optimal route based on form inputs
 */
function calculateOptimalRoute() {
    const from = $('#warehouseSelect').val();
    const to = $('#disasterZoneSelect').val();
    const transportType = $('input[name="transportType"]:checked').attr('id');
    const priority = $('#prioritySelect').val();
    
    if (!from || !to) {
        showToast('Please select both origin and destination', 'danger');
        return;
    }
    
    // Show loading state
    $('#routeSummary').html(`
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);
    
    // In a real app, this would call your routing API
    // For prototype, we'll use mock data
    setTimeout(() => {
        displayRouteResult(getMockRoute(from, to, transportType, priority));
    }, 1000);
}

/**
 * Display route results on map and panel
 */
function displayRouteResult(routeData) {
    // Clear existing route
    if (routingControl) {
        routeMap.removeControl(routingControl);
    }
    
    // Create new route
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(routeData.from.lat, routeData.from.lng),
            L.latLng(routeData.to.lat, routeData.to.lng)
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: {
            styles: [{
                color: getRouteColor(routeData.priority),
                opacity: 0.8,
                weight: 6
            }]
        }
    }).addTo(routeMap);
    
    // Store current route
    currentRoute = routeData;
    
    // Update route summary
    updateRouteSummary(routeData);
    
    // Show alternative routes
    showAlternativeRoutes(routeData);
    
    // Show hazards if any
    showHazards(routeData.hazards);
}

/**
 * Update the route summary panel
 */
function updateRouteSummary(route) {
    const transportIcon = {
        truck: 'fa-truck',
        drone: 'fa-drone-alt',
        boat: 'fa-ship'
    }[route.transportType];
    
    const priorityClass = {
        normal: 'normal',
        high: 'high',
        critical: 'critical'
    }[route.priority];
    
    const html = `
        <div class="route-summary-card ${priorityClass}">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">
                    <i class="fas ${transportIcon} me-2"></i>
                    ${route.from.name} to ${route.to.name}
                </h6>
                <span class="badge bg-${getPriorityBadgeClass(route.priority)}">
                    ${route.priority.toUpperCase()}
                </span>
            </div>
            <div class="row small">
                <div class="col-6">
                    <div class="text-muted">Distance</div>
                    <div>${route.distance} km</div>
                </div>
                <div class="col-6">
                    <div class="text-muted">Est. Time</div>
                    <div>${route.time}</div>
                </div>
            </div>
            <div class="row small mt-2">
                <div class="col-6">
                    <div class="text-muted">Transport</div>
                    <div>${route.transportType.toUpperCase()}</div>
                </div>
                <div class="col-6">
                    <div class="text-muted">Hazards</div>
                    <div>${route.hazards.length}</div>
                </div>
            </div>
        </div>
    `;
    
    $('#routeSummary').html(html);
}

/**
 * Show alternative routes
 */
function showAlternativeRoutes(mainRoute) {
    // In a real app, these would come from your API
    const alternatives = [
        {
            id: 1,
            distance: (mainRoute.distance * 1.2).toFixed(1) + ' km',
            time: addTime(mainRoute.time, 30),
            hazards: mainRoute.hazards.length - 1,
            reason: "Avoids flood zone in Bihar"
        },
        {
            id: 2,
            distance: (mainRoute.distance * 1.5).toFixed(1) + ' km',
            time: addTime(mainRoute.time, 75),
            hazards: 0,
            reason: "Complete hazard-free route"
        }
    ];
    
    let html = '';
    
    alternatives.forEach(alt => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="alternative-route" data-route-id="${alt.id}">
                    <div class="d-flex justify-content-between">
                        <strong>${alt.distance}</strong>
                        <span class="badge bg-secondary">${alt.time}</span>
                    </div>
                    <div class="small mt-1">
                        <i class="fas fa-${alt.hazards > 0 ? 'skull-crossbones text-danger' : 'check-circle text-success'} me-1"></i>
                        ${alt.hazards} hazards
                    </div>
                    <div class="small text-muted mt-1">${alt.reason}</div>
                </div>
            </div>
        `;
    });
    
    $('#altRoutes').html(html || `
        <div class="col-12">
            <div class="alert alert-info">
                No alternative routes available for this path.
            </div>
        </div>
    `);
    
    // Add click handlers
    $('.alternative-route').click(function() {
        $('.alternative-route').removeClass('active');
        $(this).addClass('active');
        // In real app, would update the map with this alternative
    });
}

/**
 * Toggle hazard avoidance
 */
function toggleHazardAvoidance() {
    const btn = $(this);
    btn.toggleClass('active');
    
    if (btn.hasClass('active')) {
        btn.html('<i class="fas fa-shield-alt me-2"></i> Avoiding Hazards');
        showToast('Hazard avoidance activated', 'success');
        
        // In real app, would recalculate route avoiding hazards
        if (currentRoute) {
            const safeRoute = JSON.parse(JSON.stringify(currentRoute));
            safeRoute.hazards = [];
            safeRoute.distance = (parseFloat(currentRoute.distance) * 1.2).toFixed(1) + ' km';
            safeRoute.time = addTime(currentRoute.time, 30);
            displayRouteResult(safeRoute);
        }
    } else {
        btn.html('<i class="fas fa-skull-crossbones me-2"></i> Avoid Hazards');
        if (currentRoute) {
            displayRouteResult(currentRoute);
        }
    }
}

/**
 * Display hazards on map and panel
 */
function showHazards(hazards) {
    // Clear existing hazards
    $('#hazardAlerts').empty();
    
    if (hazards.length === 0) {
        $('#hazardAlerts').html(`
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                No hazards detected on this route
            </div>
        `);
        return;
    }
    
    hazards.forEach(hazard => {
        $('#hazardAlerts').append(`
            <div class="hazard-alert">
                <div class="d-flex align-items-center">
                    <i class="fas fa-${getHazardIcon(hazard.type)} me-2 text-danger"></i>
                    <strong>${hazard.type.toUpperCase()}</strong>
                </div>
                <div class="small mt-1">${hazard.location} (${hazard.severity} severity)</div>
                <div class="small text-muted">${hazard.advice}</div>
            </div>
        `);
        
        // Add hazard marker to map
        L.marker([hazard.lat, hazard.lng], {
            icon: L.divIcon({
                className: 'hazard-marker',
                html: `<i class="fas fa-${getHazardIcon(hazard.type)}"></i>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(routeMap)
          .bindPopup(`<b>${hazard.type.toUpperCase()}</b><br>${hazard.location}<br>Severity: ${hazard.severity}`);
    });
}

/**
 * Print current route
 */
function printRoute() {
    if (!currentRoute) {
        showToast('No route to print', 'warning');
        return;
    }
    
    // In a real app, would generate a printable version
    showToast('Route sent to print queue', 'success');
}

// ===== HELPER FUNCTIONS =====

/**
 * Get mock route data (replace with API call)
 */
function getMockRoute(from, to, transportType, priority) {
    const warehouses = {
        guwahati: { name: "Guwahati Central", lat: 26.1445, lng: 91.7362 },
        patna: { name: "Patna Storage", lat: 25.5941, lng: 85.1376 },
        mumbai: { name: "Mumbai Depot", lat: 19.0760, lng: 72.8777 }
    };
    
    const disasterZones = {
        assam_flood: { name: "Assam Flood Area", lat: 26.2006, lng: 92.9376 },
        bihar_flood: { name: "Bihar Flood Area", lat: 25.0961, lng: 85.3131 },
        gujarat_quake: { name: "Gujarat Earthquake", lat: 23.0225, lng: 72.5714 }
    };
    
    // Simulate different route characteristics based on transport type
    const routeProps = {
        truck: { distance: 280, time: '8h 15m' },
        drone: { distance: 210, time: '2h 45m' },
        boat: { distance: 320, time: '12h 30m' }
    };
    
    return {
        from: warehouses[from],
        to: disasterZones[to],
        transportType: transportType,
        priority: priority,
        distance: routeProps[transportType].distance + ' km',
        time: routeProps[transportType].time,
        hazards: getMockHazards(from, to)
    };
}

/**
 * Generate mock hazards (replace with API call)
 */
function getMockHazards(from, to) {
    const hazards = [];
    
    // Flood hazard for Bihar routes
    if (to === 'bihar_flood') {
        hazards.push({
            type: 'flood',
            location: "Near Patna",
            severity: "high",
            lat: 25.5,
            lng: 85.2,
            advice: "Use alternate route via NH27"
        });
    }
    
    // Landslide hazard for Assam routes
    if (from === 'guwahati' || to === 'assam_flood') {
        hazards.push({
            type: 'landslide',
            location: "Near Guwahati",
            severity: "medium",
            lat: 26.1,
            lng: 91.8,
            advice: "Reduce speed and proceed with caution"
        });
    }
    
    return hazards;
}

/**
 * Get hazard icon
 */
function getHazardIcon(type) {
    const icons = {
        flood: 'water',
        landslide: 'mountain',
        fire: 'fire',
        earthquake: 'house-damage',
        default: 'exclamation-triangle'
    };
    return icons[type] || icons.default;
}

/**
 * Get route color based on priority
 */
function getRouteColor(priority) {
    const colors = {
        normal: '#17a2b8',
        high: '#ffc107',
        critical: '#dc3545'
    };
    return colors[priority] || colors.normal;
}

/**
 * Get priority badge class
 */
function getPriorityBadgeClass(priority) {
    const classes = {
        normal: 'info',
        high: 'warning',
        critical: 'danger'
    };
    return classes[priority] || classes.normal;
}

/**
 * Add minutes to time string (simplified)
 */
function addTime(timeStr, minutes) {
    // Simple mock - in real app would use Date objects
    const [h, m] = timeStr.split('h ');
    const totalMins = parseInt(h) * 60 + parseInt(m) + minutes;
    return `${Math.floor(totalMins/60)}h ${totalMins%60}m`;
}

// Import the map instance (ensure map-loader.js is loaded first in your HTML)
const emergencyMap = window.emergencyMap;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize route planning form
  const routeForm = document.getElementById('route-form');
  const optimizeBtn = document.getElementById('optimize-route');
  
  // Event listener for manual route planning
  routeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    optimizeBtn.disabled = true;
    optimizeBtn.textContent = 'Optimizing...';
    
    try {
      const response = await fetch('/api/routes.php', {
        method: 'POST',
        body: new FormData(routeForm)
      });
      
      const routeData = await response.json();
      
      // Convert waypoints to LatLng array
      const waypoints = routeData.waypoints.map(wp => [wp.latitude, wp.longitude]);
      
      // Plot the optimized route on map
      emergencyMap.plotOptimizedRoute(waypoints);
      
      // Display route details
      document.getElementById('route-details').innerHTML = `
        <h4>Optimized Route</h4>
        <p>Distance: ${routeData.distance} km</p>
        <p>Estimated Time: ${routeData.time}</p>
        <p>Resource Required: ${routeData.resources.join(', ')}</p>
      `;
    } catch (error) {
      console.error('Route optimization failed:', error);
      alert('Failed to optimize route. Please try again.');
    } finally {
      optimizeBtn.disabled = false;
      optimizeBtn.textContent = 'Optimize Route';
    }
  });

  // Event delegation for map click waypoint addition
  document.addEventListener('mapClick', (e) => {
    if (document.getElementById('add-waypoints').checked) {
      const waypointList = document.getElementById('waypoints-list');
      const waypointItem = document.createElement('div');
      waypointItem.className = 'waypoint-item';
      waypointItem.innerHTML = `
        <span>Lat: ${e.detail.lat.toFixed(4)}, Lng: ${e.detail.lng.toFixed(4)}</span>
        <input type="hidden" name="waypoints[]" value="${e.detail.lat},${e.detail.lng}">
        <button class="remove-waypoint">×</button>
      `;
      waypointList.appendChild(waypointItem);
    }
  });

  // Handle waypoint removal
  document.getElementById('waypoints-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-waypoint')) {
      e.target.parentElement.remove();
    }
  });
});

class RouteService {
    static async calculateRoute(disasterId, resourceType, quantity) {
        const response = await fetch('/backend/api/routes.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                disaster_id: disasterId,
                resource_type: resourceType,
                quantity: quantity
            })
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }

    static async getRouteDetails(routeId) {
        const response = await fetch(`/backend/api/routes.php?id=${routeId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }
}

// Example Usage
async function optimizeSupplyRoute() {
    const disasterId = document.getElementById('disaster-select').value;
    const resourceType = document.getElementById('resource-type').value;
    const quantity = document.getElementById('quantity').value;

    try {
        const result = await RouteService.calculateRoute(disasterId, resourceType, quantity);
        displayRoutes(result.routes);
    } catch (error) {
        console.error("Route optimization failed:", error);
        alert("Error: " + error.message);
    }
}

function displayRoutes(routes) {
    const container = document.getElementById('routes-container');
    container.innerHTML = routes.map(route => `
        <div class="route-card">
            <h4>From: ${route.warehouse_name}</h4>
            <p>Distance: ${route.distance_km.toFixed(1)} km</p>
            <p>Quantity: ${route.quantity} units</p>
            <div class="route-map" data-coords='${JSON.stringify(route.coordinates)}'></div>
        </div>
    `).join('');
}