// frontend/assets/js/map-loader.js

class EmergencyMap {
    constructor(mapId = 'map-container') {
      this.map = L.map(mapId).setView([20.5937, 78.9629], 5); // Default to India view
      this.markers = {};
      this.disasterLayers = {};
      this.resourceLayers = {};
      
      // Initialize base map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
  
      this._setupEventListeners();
    }
  
    _setupEventListeners() {
      this.map.on('click', (e) => {
        console.log('Map clicked at:', e.latlng);
        // Dispatch custom event
        const event = new CustomEvent('mapClick', { detail: e.latlng });
        document.dispatchEvent(event);
      });
    }
  
    addDisasterMarker(lat, lng, type, properties = {}) {
      const icon = L.icon({
        iconUrl: `assets/images/disasters/${type}.png`,
        iconSize: [32, 32]
      });
  
      const marker = L.marker([lat, lng], { icon }).addTo(this.map);
      marker.bindPopup(this._createDisasterPopup(properties));
      
      if (!this.disasterLayers[type]) {
        this.disasterLayers[type] = L.layerGroup().addTo(this.map);
      }
      this.disasterLayers[type].addLayer(marker);
      
      return marker;
    }
  
    addResourceMarker(lat, lng, resourceType, properties = {}) {
      const icon = L.icon({
        iconUrl: `assets/images/markers/${resourceType}.png`,
        iconSize: [28, 28]
      });
  
      const marker = L.marker([lat, lng], { icon }).addTo(this.map);
      marker.bindPopup(this._createResourcePopup(properties));
      
      if (!this.resourceLayers[resourceType]) {
        this.resourceLayers[resourceType] = L.layerGroup().addTo(this.map);
      }
      this.resourceLayers[resourceType].addLayer(marker);
      
      return marker;
    }
  
    _createDisasterPopup(properties) {
      return `
        <div class="disaster-popup">
          <h4>${properties.name || 'Disaster'}</h4>
          <p>Type: ${properties.type}</p>
          <p>Severity: ${properties.severity}/10</p>
          <p>Affected: ${properties.affected || 'Unknown'}</p>
          <button class="btn-route" data-lat="${properties.lat}" data-lng="${properties.lng}">
            Plan Route
          </button>
        </div>
      `;
    }
  
    _createResourcePopup(properties) {
      return `
        <div class="resource-popup">
          <h4>${properties.name || 'Resource'}</h4>
          <p>Type: ${properties.type}</p>
          <p>Capacity: ${properties.capacity || 'Unknown'}</p>
          <p>Status: ${properties.status || 'Available'}</p>
        </div>
      `;
    }
  
    clearLayer(layerType) {
      if (this.disasterLayers[layerType]) {
        this.map.removeLayer(this.disasterLayers[layerType]);
      }
      if (this.resourceLayers[layerType]) {
        this.map.removeLayer(this.resourceLayers[layerType]);
      }
    }
  
    plotOptimizedRoute(waypoints) {
      // Clear existing routes if any
      if (this.routeLayer) {
        this.map.removeLayer(this.routeLayer);
      }
  
      this.routeLayer = L.layerGroup().addTo(this.map);
      
      // Create polyline
      const routeLine = L.polyline(waypoints, {
        color: '#3a7bd5',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      }).addTo(this.routeLayer);
  
      // Add markers for each waypoint
      waypoints.forEach((point, index) => {
        L.marker(point).addTo(this.routeLayer)
          .bindPopup(`Waypoint ${index + 1}<br>Lat: ${point[0].toFixed(4)}, Lng: ${point[1].toFixed(4)}`);
      });
  
      // Fit bounds to show entire route
      this.map.fitBounds(routeLine.getBounds());
    }
  }
  
  // Initialize map when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.emergencyMap = new EmergencyMap();
    
    // Example usage - would be replaced with real data from API
    if (window.location.pathname.includes('dashboard')) {
      // Sample data - in real app this would come from API
      window.emergencyMap.addDisasterMarker(19.0760, 72.8777, 'flood', {
        name: 'Mumbai Flood',
        type: 'Flood',
        severity: 8,
        affected: '2.5M people'
      });
      
      window.emergencyMap.addResourceMarker(19.0760, 72.8777, 'hospital', {
        name: 'JJ Hospital',
        type: 'Hospital',
        capacity: '1200 beds'
      });
    }
  });