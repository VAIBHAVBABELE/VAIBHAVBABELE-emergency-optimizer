/**
 * Emergency Supply Optimizer - Drone Control Module
 * Handles all drone-related functionality including:
 * - Fleet status monitoring
 * - Live map tracking
 * - Dispatch controls
 * - Emergency procedures
 */

// Global variables
let droneMap;
let droneMarkers = {};
let telemetryInterval;

// Document Ready Handler
$(document).ready(function() {
    initDroneMap();
    loadDroneFleet();
    setupDroneEventListeners();
});

/**
 * Initialize the drone tracking map
 */
function initDroneMap() {
    // Center map on India by default
    droneMap = L.map('droneMap').setView([20.5937, 78.9629], 5);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(droneMap);
    
    // Add zoom controls
    L.control.zoom({ position: 'topright' }).addTo(droneMap);
}

/**
 * Load drone fleet status
 */
function loadDroneFleet() {
    // Show loading state
    $('#droneStatusContainer').html(`
        <div class="col-12 text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);
    
    // In a real app, this would fetch from your API
    // For prototype, we'll use mock data
    setTimeout(() => {
        const mockDrones = [
            { id: 1, name: "DRONE-ALPHA", battery: 100, status: "ready", location: [26.2006, 92.9376] },
            { id: 2, name: "DRONE-BETA", battery: 75, status: "charging", location: [19.0760, 72.8777] },
            { id: 3, name: "DRONE-GAMMA", battery: 45, status: "on-mission", location: [22.5726, 88.3639] }
        ];
        
        renderDroneFleet(mockDrones);
        updateDroneSelect(mockDrones);
        startTelemetryUpdates(mockDrones);
    }, 1000);
}

/**
 * Render drone fleet cards
 */
function renderDroneFleet(drones) {
    let fleetHtml = '';
    
    drones.forEach(drone => {
        const statusClass = getStatusClass(drone.status);
        const statusText = drone.status.replace('-', ' ').toUpperCase();
        
        fleetHtml += `
            <div class="col-md-6 col-lg-12 mb-3">
                <div class="drone-card ${statusClass}" data-drone-id="${drone.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-0"><i class="fas fa-drone-alt me-2"></i>${drone.name}</h6>
                        <span class="badge ${statusClass}-light status-badge">${statusText}</span>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">Battery:</small>
                        <div class="battery-indicator">
                            <div class="battery-level" style="width: ${drone.battery}%"></div>
                        </div>
                        <small class="text-muted">${drone.battery}% remaining</small>
                    </div>
                    <div class="mt-2 d-grid">
                        <button class="btn btn-sm btn-outline-${drone.status === 'ready' ? 'primary' : 'secondary'} dispatch-btn" ${drone.status !== 'ready' ? 'disabled' : ''}>
                            <i class="fas fa-paper-plane me-1"></i> Dispatch
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add/update marker on map
        updateDroneMarker(drone);
    });
    
    $('#droneStatusContainer').html(fleetHtml);
}

/**
 * Update drone select dropdown
 */
function updateDroneSelect(drones) {
    let options = '<option value="">-- Choose Drone --</option>';
    
    drones.forEach(drone => {
        if (drone.status === 'ready') {
            options += `<option value="${drone.id}">${drone.name} (Battery: ${drone.battery}%)</option>`;
        }
    });
    
    $('#droneSelect').html(options);
}

/**
 * Update drone marker on map
 */
function updateDroneMarker(drone) {
    const statusClass = getStatusClass(drone.status);
    
    // Custom icon based on status
    const droneIcon = L.divIcon({
        className: `drone-marker ${statusClass}`,
        html: `<i class="fas fa-drone-alt"></i><span class="drone-name">${drone.name}</span>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
    
    // Update existing marker or create new one
    if (droneMarkers[drone.id]) {
        droneMarkers[drone.id]
            .setLatLng(drone.location)
            .setIcon(droneIcon);
    } else {
        droneMarkers[drone.id] = L.marker(drone.location, {
            icon: droneIcon,
            zIndexOffset: 1000
        }).addTo(droneMap)
          .bindPopup(`<b>${drone.name}</b><br>Status: ${drone.status}<br>Battery: ${drone.battery}%`);
    }
}

/**
 * Start simulated telemetry updates
 */
function startTelemetryUpdates(drones) {
    // Clear any existing interval
    if (telemetryInterval) clearInterval(telemetryInterval);
    
    // Update telemetry every 3 seconds
    telemetryInterval = setInterval(() => {
        const updatedDrones = drones.map(drone => {
            // Simulate changes
            if (drone.status === 'on-mission' || drone.status === 'returning') {
                // Move drone slightly
                drone.location[0] += (Math.random() - 0.5) * 0.01;
                drone.location[1] += (Math.random() - 0.5) * 0.01;
                
                // Reduce battery
                drone.battery = Math.max(0, drone.battery - 1);
                
                // Return if battery low
                if (drone.battery < 20 && drone.status !== 'returning') {
                    drone.status = 'returning';
                }
            } else if (drone.status === 'charging') {
                // Charge battery
                drone.battery = Math.min(100, drone.battery + 5);
                if (drone.battery === 100) {
                    drone.status = 'ready';
                }
            } else if (drone.status === 'returning' && drone.battery < 5) {
                // Land and charge
                drone.status = 'charging';
            }
            
            return drone;
        });
        
        // Update UI
        renderDroneFleet(updatedDrones);
        updateDroneSelect(updatedDrones);
        updateTelemetryTable(updatedDrones);
    }, 3000);
}

/**
 * Update telemetry table
 */
function updateTelemetryTable(drones) {
    let tableHtml = '';
    const now = new Date();
    
    drones.forEach(drone => {
        const speed = (Math.random() * 30 + 10).toFixed(1);
        const altitude = (Math.random() * 50 + 50).toFixed(0);
        const timeStr = now.toLocaleTimeString();
        
        tableHtml += `
            <tr>
                <td>${drone.name}</td>
                <td>${drone.location[0].toFixed(4)}</td>
                <td>${drone.location[1].toFixed(4)}</td>
                <td>${altitude}</td>
                <td>${speed}</td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar ${getBatteryClass(drone.battery)}" 
                             role="progressbar" 
                             style="width: ${drone.battery}%">
                            ${drone.battery}%
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge ${getStatusClass(drone.status)}-light">
                        ${drone.status.replace('-', ' ').toUpperCase()}
                    </span>
                </td>
                <td>${timeStr}</td>
            </tr>
        `;
    });
    
    $('#telemetryTable tbody').html(tableHtml);
}

/**
 * Setup event listeners for drone controls
 */
function setupDroneEventListeners() {
    // Dispatch form submission
    $('#dispatchForm').submit(function(e) {
        e.preventDefault();
        
        const droneId = $('#droneSelect').val();
        const destination = $('#destinationInput').val();
        const payload = $('#payloadInput').val();
        
        if (!droneId || !destination) {
            showToast('Please select a drone and destination', 'danger');
            return;
        }
        
        dispatchDrone(droneId, destination, payload);
    });
    
    // Emergency stop button
    $('#emergencyStop').click(function() {
        if (confirm('Are you sure you want to EMERGENCY STOP all drones?')) {
            emergencyStopAll();
        }
    });
    
    // Map controls
    $('#zoomIn').click(() => droneMap.zoomIn());
    $('#zoomOut').click(() => droneMap.zoomOut());
    $('#centerMap').click(() => {
        droneMap.setView([20.5937, 78.9629], 5);
    });
    
    // Dispatch buttons on drone cards
    $(document).on('click', '.dispatch-btn', function() {
        const droneCard = $(this).closest('.drone-card');
        const droneId = droneCard.data('drone-id');
        const droneName = droneCard.find('h6').text().trim();
        
        $('#droneSelect').val(droneId);
        $('#destinationInput').focus();
        
        showToast(`Selected ${droneName} for dispatch`, 'info');
    });
}

/**
 * Dispatch a drone
 */
function dispatchDrone(droneId, destination, payload) {
    // In a real app, this would call your API
    showToast(`Drone ${droneId} dispatched to ${destination} with ${payload}kg payload`, 'success');
    
    // Reset form
    $('#dispatchForm')[0].reset();
    
    // Simulate status change
    setTimeout(() => {
        $(`.drone-card[data-drone-id="${droneId}"]`)
            .removeClass('ready')
            .addClass('on-mission')
            .find('.status-badge')
            .removeClass('bg-primary-light')
            .addClass('bg-success-light')
            .text('ON MISSION');
            
        $(`.drone-card[data-drone-id="${droneId}"] .dispatch-btn`)
            .prop('disabled', true)
            .removeClass('btn-outline-primary')
            .addClass('btn-outline-secondary');
    }, 1000);
}

/**
 * Emergency stop all drones
 */
function emergencyStopAll() {
    // In a real app, this would call your API
    showToast('EMERGENCY STOP initiated for all drones!', 'danger');
    
    // Simulate status changes
    $('.drone-card').each(function() {
        const card = $(this);
        if (!card.hasClass('charging') && !card.hasClass('ready')) {
            card.removeClass('on-mission returning')
                .addClass('emergency')
                .find('.status-badge')
                .removeClass('bg-success-light bg-secondary-light')
                .addClass('bg-danger-light')
                .text('EMERGENCY');
        }
    });
}

/**
 * Helper: Get CSS class for drone status
 */
function getStatusClass(status) {
    const statusClasses = {
        'ready': 'bg-primary',
        'charging': 'bg-warning',
        'on-mission': 'bg-success',
        'returning': 'bg-secondary',
        'emergency': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
}

/**
 * Helper: Get battery class based on percentage
 */
function getBatteryClass(percent) {
    if (percent > 70) return 'bg-success';
    if (percent > 30) return 'bg-warning';
    return 'bg-danger';
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

// Import the map instance
const emergencyMap = window.emergencyMap;

class DroneController {
  constructor() {
    this.droneMarkers = {};
    this.socket = null;
    this.connectWebSocket();
  }

  connectWebSocket() {
    this.socket = new WebSocket(`wss://${window.location.host}/drones/updates`);
    
    this.socket.onopen = () => {
      console.log('Drone connection established');
      document.getElementById('connection-status').textContent = 'Connected';
      document.getElementById('connection-status').className = 'status-connected';
    };
    
    this.socket.onmessage = (event) => {
      const droneData = JSON.parse(event.data);
      this.updateDronePosition(droneData);
      this.updateTelemetryUI(droneData);
    };
    
    this.socket.onclose = () => {
      console.log('Drone connection closed');
      document.getElementById('connection-status').textContent = 'Disconnected';
      document.getElementById('connection-status').className = 'status-disconnected';
      setTimeout(() => this.connectWebSocket(), 5000); // Reconnect after 5 seconds
    };
  }

  updateDronePosition(drone) {
    if (!this.droneMarkers[drone.id]) {
      this.droneMarkers[drone.id] = L.marker([drone.lat, drone.lng], {
        icon: L.icon({
          iconUrl: 'assets/images/drone.png',
          iconSize: [32, 32]
        }),
        zIndexOffset: 1000 // Ensure drones appear above other markers
      }).addTo(emergencyMap.map)
        .bindPopup(this.createDronePopup(drone));
    } else {
      this.droneMarkers[drone.id]
        .setLatLng([drone.lat, drone.lng])
        .setPopupContent(this.createDronePopup(drone));
    }
    
    // Auto-pan to drone if it's selected
    if (document.getElementById(`drone-${drone.id}`)?.classList.contains('active')) {
      emergencyMap.map.panTo([drone.lat, drone.lng]);
    }
  }

  createDronePopup(drone) {
    return `
      <div class="drone-popup">
        <h4>Drone ${drone.id}</h4>
        <p>Status: ${drone.status}</p>
        <p>Battery: ${drone.battery}%</p>
        <p>Speed: ${drone.speed} km/h</p>
        <button onclick="window.dispatchDrone(${drone.id})" 
                ${drone.status !== 'idle' ? 'disabled' : ''}>
          Dispatch
        </button>
      </div>
    `;
  }

  updateTelemetryUI(drone) {
    const droneElement = document.getElementById(`drone-${drone.id}`);
    if (droneElement) {
      droneElement.querySelector('.drone-battery').style.width = `${drone.battery}%`;
      droneElement.querySelector('.drone-status').textContent = drone.status;
      droneElement.querySelector('.drone-location').textContent = 
        `${drone.lat.toFixed(4)}, ${drone.lng.toFixed(4)}`;
    }
  }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  window.droneController = new DroneController();
  
  // Dispatch button handler
  window.dispatchDrone = (droneId) => {
    const target = prompt('Enter target coordinates (lat,lng):');
    if (target) {
      fetch(`/api/drones.php?id=${droneId}`, {
        method: 'POST',
        body: JSON.stringify({ target })
      }).then(response => {
        if (!response.ok) throw new Error('Dispatch failed');
        alert(`Drone ${droneId} dispatched!`);
      }).catch(error => {
        alert(error.message);
      });
    }
  };
});