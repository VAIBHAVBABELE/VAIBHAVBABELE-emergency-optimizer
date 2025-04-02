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
    let html = '';
    
    insights.forEach((insight, index) => {
        html += `
            <div class="insight-card ${disasterType}">
                <div class="d-flex">
                    <div class="flex-shrink-0 me-2">
                        <i class="fas fa-${index === 0 ? 'exclamation-triangle' : 'lightbulb'}"></i>
                    </div>
                    <div class="flex-grow-1">
                        ${insight}
                    </div>
                </div>
            </div>
        `;
    });
    
    $('#aiInsights').html(html);
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