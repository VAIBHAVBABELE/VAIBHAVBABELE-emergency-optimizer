// In your prediction.html or dashboard.js
async function loadPredictions() {
    try {
        const disasterId = getSelectedDisasterId(); // Implement this
        const prediction = await PredictionService.predictDemand(
            disasterId, 
            ['medical', 'food', 'shelter']
        );
        
        renderPredictionChart(prediction.results);
    } catch (error) {
        console.error("Prediction failed:", error);
        showAlert("Failed to generate prediction", "error");
    }
}

function renderPredictionChart(predictionData) {
    // Example using Chart.js
    const ctx = document.getElementById('predictionChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(predictionData),
            datasets: [
                {
                    label: 'Next 24h',
                    data: Object.values(predictionData).map(x => x.next_24h),
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                },
                {
                    label: 'Next 48h',
                    data: Object.values(predictionData).map(x => x.next_48h),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Estimated Demand'
                    }
                }
            }
        }
    });
}