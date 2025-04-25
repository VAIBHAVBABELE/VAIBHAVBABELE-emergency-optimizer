/**
 * Emergency Supply Optimizer - Prediction Module
 * Handles AI demand forecasting and visualization
 */

// Global chart reference
let demandChart;

// Document Ready Handler
$(document).ready(function() {
    initPredictionPage();
    loadInitialPredictions();
});

/**
 * Initialize prediction page
 */
function initPredictionPage() {
    // Event listeners
    $('#disasterType, #regionSelect').change(updatePredictions);
    $('[data-range]').click(function() {
        $('[data-range]').removeClass('active');
        $(this).addClass('active');
        updatePredictions();
    });
    
    // Initialize chart
    initDemandChart();
}

/**
 * Initialize Chart.js chart
 */
function initDemandChart() {
    const ctx = document.getElementById('demandChart').getContext('2d');
    
    demandChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
                        }
                    }
                },
                legend: { position: 'top' }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    title: { display: true, text: 'Units Required' }
                },
                x: {
                    title: { display: true, text: 'Time Period' }
                }
            }
        }
    });
}

/**
 * Load initial predictions
 */
function loadInitialPredictions() {
    // Show loading state
    $('#aiInsights').html(`
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);
    
    // Mock API call - in real app, fetch from your backend
    setTimeout(() => {
        const disasterType = $('#disasterType').val();
        const region = $('#regionSelect').val();
        generatePredictions(disasterType, region, 24);
    }, 800);
}

/**
 * Update predictions based on user selection
 */
function updatePredictions() {
    const disasterType = $('#disasterType').val();
    const region = $('#regionSelect').val();
    const timeRange = $('[data-range].active').data('range');
    
    generatePredictions(disasterType, region, timeRange);
}

/**
 * Generate predictions and update UI
 */
function generatePredictions(disasterType, region, hours) {
    // Mock data - replace with actual API call
    const mockData = {
        flood: {
            labels: ['0-6h', '6-12h', '12-18h', '18-24h'],
            food: [1200, 3500, 6000, 4500],
            medicine: [150, 400, 700, 500],
            shelters: [5, 15, 25, 20],
            insights: [
                "Peak demand expected in 12-18h window",
                "Prioritize boat deployment to flood zones",
                "Medical needs 23% higher than historical average"
            ]
        },
        earthquake: {
            labels: ['0-6h', '6-12h', '12-18h', '18-24h'],
            food: [8000, 12000, 8000, 4000],
            medicine: [1200, 1800, 1200, 600],
            shelters: [40, 60, 40, 20],
            insights: [
                "Immediate shelter demand critical",
                "72% of medical needs are trauma-related",
                "Food demand spikes within first 12h"
            ]
        }
    };
    
    const data = mockData[disasterType] || mockData.flood;
    
    // Update chart
    updateChart(data, hours);
    
    // Update insights
    renderInsights(data.insights, disasterType);
    
    // Update data table
    updatePredictionTable(data, region);
}

/**
 * Update the Chart.js chart
 */
function updateChart(data, hours) {
    // Adjust data based on time range
    const pointCount = Math.min(4, Math.ceil(hours / 6));
    const slicedLabels = data.labels.slice(0, pointCount);
    
    demandChart.data.labels = slicedLabels;
    demandChart.data.datasets = [
        {
            label: 'Food Packets',
            data: data.food.slice(0, pointCount),
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.3,
            fill: true
        },
        {
            label: 'Medicine Kits',
            data: data.medicine.slice(0, pointCount),
            borderColor: '#17a2b8',
            backgroundColor: 'rgba(23, 162, 184, 0.1)',
            tension: 0.3,
            fill: true
        },
        {
            label: 'Shelters',
            data: data.shelters.slice(0, pointCount),
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            tension: 0.3,
            fill: true,
            hidden: true // Hide by default
        }
    ];
    
    demandChart.update();
}

/**
 * Render AI insights cards
 */
function renderInsights(insights, disasterType) {
    // Disaster-specific insight templates
    const disasterInsights = {
        flood: {
            icon: 'fa-water',
            alerts: [
                "Water levels rising rapidly in 3 districts",
                "River embankments breached at 2 locations",
                "50+ villages cut off from road access"
            ],
            recommendations: [
                "Deploy 2000 water purification tablets immediately",
                "Prepare 500 inflatable boats for rescue operations",
                "Stock extra anti-diarrheal medication in flood-prone areas",
                "Alert hospitals about potential leptospirosis cases"
            ]
        },
        earthquake: {
            icon: 'fa-mountain',
            alerts: [
                "Magnitude 6.3 quake with 12 aftershocks",
                "3 buildings collapsed in epicenter area",
                "Power outages reported in 5 districts"
            ],
            recommendations: [
                "Mobilize search & rescue teams with structural engineers",
                "Prepare 2000 trauma kits for crush injuries",
                "Set up 10 mobile ICU units near affected areas",
                "Prioritize temporary shelters with earthquake-resistant design"
            ]
        },
        cyclone: {
            icon: 'fa-wind',
            alerts: [
                "Cyclone intensifying to Category 4",
                "Storm surge expected in coastal areas",
                "Red alert issued for 3 coastal districts"
            ],
            recommendations: [
                "Evacuate populations within 10km of coastline",
                "Stock 3000 emergency food packets",
                "Prepare 200 generators for power backup",
                "Secure all temporary shelters against high winds"
            ]
        },
        // Add more disaster types as needed
        pandemic: {
            icon: 'fa-virus',
            alerts: [
                "Rapid spread in urban areas detected",
                "Hospital occupancy reaching 85% capacity",
                "New variant with higher transmission rate"
            ],
            recommendations: [
                "Distribute 50,000 PPE kits to healthcare workers",
                "Set up 10 mobile testing centers",
                "Prepare isolation wards with 2000 beds",
                "Stock extra oxygen concentrators in rural clinics"
            ]
        },
        wildfire: {
            icon: 'fa-fire',
            alerts: [
                "Wildfire spreading rapidly across 500+ acres",
                "3 communities under evacuation orders",
                "Air quality index reaching hazardous levels"
            ],
            recommendations: [
                "Deploy 20 firefighting teams with aerial support",
                "Prepare 1000 N95 masks for smoke protection",
                "Set up 5 emergency shelters in safe zones",
                "Stock extra burn treatment kits in nearby hospitals"
            ]
        },
        landslide: {
            icon: 'fa-hill-rockslide',
            alerts: [
                "Multiple landslides reported in hilly areas",
                "2 major highways blocked by debris",
                "Soil saturation levels at dangerous thresholds"
            ],
            recommendations: [
                "Mobilize earth-moving equipment to clear routes",
                "Evacuate high-risk slope communities",
                "Prepare 500 emergency shelter kits",
                "Alert geologists for stability assessments"
            ]
        },
        tsunami: {
            icon: 'fa-wave-square',
            alerts: [
                "Tsunami warning issued after 7.8 magnitude quake",
                "Coastal areas expecting 3-5 meter waves",
                "Evacuation orders for areas below 10m elevation"
            ],
            recommendations: [
                "Activate all coastal warning sirens",
                "Deploy 50 rescue boats in safe zones",
                "Prepare 2000 life jackets for distribution",
                "Stock extra desalination kits for drinking water"
            ]
        },
        drought: {
            icon: 'fa-sun-plant-wilt',
            alerts: [
                "Severe drought conditions persisting for 6+ months",
                "Water reservoir levels below 20% capacity",
                "Crop failures reported in 3 districts"
            ],
            recommendations: [
                "Implement immediate water rationing measures",
                "Distribute 5000 water storage tanks",
                "Set up 10 mobile water distribution centers",
                "Prepare emergency fodder for livestock"
            ]
        },
        heatwave: {
            icon: 'fa-temperature-high',
            alerts: [
                "Extreme heat warning: 47°C+ temperatures expected",
                "Heat index reaching life-threatening levels",
                "Power grid under strain from cooling demand"
            ],
            recommendations: [
                "Open 25 cooling centers in urban areas",
                "Distribute 10,000 hydration packs",
                "Suspend outdoor work during peak hours",
                "Prepare hospitals for heatstroke cases"
            ]
        },
        coldwave: {
            icon: 'fa-temperature-low',
            alerts: [
                "Arctic blast bringing record-low temperatures",
                "Frostbite warnings in effect",
                "Heating fuel shortages reported"
            ],
            recommendations: [
                "Activate emergency warming shelters",
                "Distribute 5000 thermal blankets",
                "Prepare road salt for icy conditions",
                "Stock extra hypothermia treatment kits"
            ]
        },
        industrial: {
            icon: 'fa-industry',
            alerts: [
                "Chemical leak at industrial plant",
                "3km exclusion zone established",
                "Wind carrying contaminants NE at 15km/h"
            ],
            recommendations: [
                "Distribute 2000 gas masks to affected areas",
                "Prepare decontamination showers",
                "Alert poison control centers",
                "Evacuate downwind communities"
            ]
        },
        terrorism: {
            icon: 'fa-person-rifle',
            alerts: [
                "Terror alert level raised to HIGH",
                "Security forces on maximum alert",
                "Intelligence suggests possible attacks"
            ],
            recommendations: [
                "Increase security at sensitive locations",
                "Prepare mass casualty response kits",
                "Establish emergency communication channels",
                "Conduct vulnerability assessments"
            ]
        },
        civil: {
            icon: 'fa-people-arrows',
            alerts: [
                "Civil unrest spreading to 5 districts",
                "Road blockades affecting supply routes",
                "Emergency services facing access issues"
            ],
            recommendations: [
                "Prepare secure supply corridors",
                "Stock extra medical supplies in safe zones",
                "Establish neutral humanitarian zones",
                "Coordinate with community leaders"
            ]
        }
    };

    // Get insights for selected disaster type or default
    const disasterData = disasterInsights[disasterType] || {
        icon: 'fa-triangle-exclamation',
        alerts: ["Emergency situation developing"],
        recommendations: ["Monitor situation closely"]
    };

    let html = `
        <div class="alert alert-danger">
            <h5><i class="fas ${disasterData.icon} me-2"></i> ${disasterType.charAt(0).toUpperCase() + disasterType.slice(1)} Alerts</h5>
            <ul class="mb-0">
                ${disasterData.alerts.map(alert => `<li>${alert}</li>`).join('')}
            </ul>
        </div>
        
        <div class="alert alert-warning mt-3">
            <h5><i class="fas fa-person-digging me-2"></i> Immediate Actions Required</h5>
            <div class="action-items">
                ${disasterData.recommendations.map((rec, i) => `
                    <div class="d-flex align-items-start mb-2">
                        <div class="flex-shrink-0 me-2 text-warning">
                            <i class="fas fa-circle-${i < 3 ? 'chevron-right' : 'dot'} fa-xs"></i>
                        </div>
                        <div class="flex-grow-1">
                            ${rec}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="alert alert-info mt-3">
            <h5><i class="fas fa-chart-line me-2"></i> Resource Projections</h5>
            <div class="progress-container">
                ${generateResourceProjections(disasterType)}
            </div>
        </div>
    `;

    $('#aiInsights').html(html);
}

// Helper function for resource projections
function generateResourceProjections(disasterType) {
    const resources = {
        flood: ['Water Purification', 'Boats', 'Medical Kits', 'Blankets'],
        earthquake: ['Search Teams', 'Trauma Kits', 'Shelters', 'Heavy Equipment'],
        cyclone: ['Food Packets', 'Generators', 'Tarpaulins', 'First Aid'],
        pandemic: ['PPE Kits', 'Vaccines', 'Oxygen', 'Medicines'],
        wildfire: ['Fire Retardant', 'Masks', 'Burn Kits', 'Eye Wash'],
        landslide: ['Debris Clearance', 'Slope Sensors', 'Shelter Kits', 'GPS Units'],
        tsunami: ['Life Jackets', 'Rescue Boats', 'Desalination', 'First Aid'],
        drought: ['Water Tanks', 'Irrigation', 'Food Aid', 'Livestock Feed'],
        heatwave: ['Cooling Packs', 'Electrolytes', 'Shade Nets', 'IV Fluids'],
        coldwave: ['Blankets', 'Heaters', 'Winter Coats', 'Hot Meals'],
        industrial: ['Gas Masks', 'Decon Kits', 'Antidotes', 'Hazmat Suits'],
        terrorism: ['Trauma Kits', 'Tourniquets', 'Security Gear', 'Comms'],
        civil: ['Med Supplies', 'Food Stores', 'Security', 'Comms']
    };
    
    return (resources[disasterType] || ['Water', 'Food', 'Shelter', 'Medical']).map(resource => `
        <div class="mb-2">
            <div class="d-flex justify-content-between small mb-1">
                <span>${resource}</span>
                <span>${Math.floor(Math.random() * 100) + 50}% increase expected</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-${getResourceColor(resource)}" 
                     role="progressbar" style="width: ${Math.floor(Math.random() * 80) + 20}%">
                </div>
            </div>
        </div>
    `).join('');
}

function getResourceColor(resource) {
    const colors = {
        'Water': 'info',
        'Medical': 'danger',
        'Food': 'success',
        'Shelter': 'warning',
        'PPE': 'primary'
    };
    return colors[resource.split(' ')[0]] || 'secondary';
}



/**
 * Update prediction data table
 */
function updatePredictionTable(data, region) {
    const lastActual = {
        food: data.food[0] * 0.9, // Simulate 90% of prediction
        medicine: data.medicine[0] * 1.1, // Simulate 110% of prediction
        shelters: data.shelters[0] * 0.8 // Simulate 80% of prediction
    };
    
    const tableHtml = `
        <tr>
            <td>Food Packets</td>
            <td>${data.food[0].toLocaleString()}</td>
            <td>85%</td>
            <td>${lastActual.food.toLocaleString()}</td>
            <td class="${lastActual.food < data.food[0] ? 'positive-variance' : 'negative-variance'}">
                ${Math.abs(data.food[0] - lastActual.food).toLocaleString()}
            </td>
        </tr>
        <tr>
            <td>Medicine Kits</td>
            <td>${data.medicine[0].toLocaleString()}</td>
            <td>78%</td>
            <td>${lastActual.medicine.toLocaleString()}</td>
            <td class="${lastActual.medicine < data.medicine[0] ? 'positive-variance' : 'negative-variance'}">
                ${Math.abs(data.medicine[0] - lastActual.medicine).toLocaleString()}
            </td>
        </tr>
        <tr>
            <td>Emergency Shelters</td>
            <td>${data.shelters[0].toLocaleString()}</td>
            <td>92%</td>
            <td>${lastActual.shelters.toLocaleString()}</td>
            <td class="${lastActual.shelters < data.shelters[0] ? 'positive-variance' : 'negative-variance'}">
                ${Math.abs(data.shelters[0] - lastActual.shelters).toLocaleString()}
            </td>
        </tr>
    `;
    
    $('#predictionTable tbody').html(tableHtml);
}

/**
 * Handle offline mode predictions
 */
function loadCachedPredictions() {
    // In a real app, load from localStorage/IndexedDB
    const cachedData = JSON.parse(localStorage.getItem('cachedPredictions') || '{}');
    
    if (Object.keys(cachedData).length > 0) {
        updateChart(cachedData.data, cachedData.hours);
        renderInsights(cachedData.insights, cachedData.disasterType);
        updatePredictionTable(cachedData.data, cachedData.region);
    } else {
        $('#aiInsights').html(`
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                No cached prediction data available.
            </div>
        `);
    }
}

class PredictionService {
    static async predictDemand(disasterId, resourceTypes) {
        const response = await fetch('/backend/api/predict.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                disaster_id: disasterId,
                data_points: {
                    resource_types: resourceTypes,
                    timestamp: new Date().toISOString()
                }
            })
        });
        
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }

    static async getLatestPrediction(disasterId) {
        const response = await fetch(`/backend/api/predict.php?disaster_id=${disasterId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }
}

// Implement these or replace with your actual functions
function getSelectedDisasterId() {
    return document.querySelector('#disaster-select').value;
}

function showAlert(message, type) {
    alert(`${type.toUpperCase()}: ${message}`);
}