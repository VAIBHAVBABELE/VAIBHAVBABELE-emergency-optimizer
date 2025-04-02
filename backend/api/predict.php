<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '../config/db.php';
require_once __DIR__ . '../config/constants.php';
require_once __DIR__ . '../models/PredictionModel.php';
require_once __DIR__ . '../libs/AIPredictor.php';

// Authenticate request
$auth = verifyToken();
if (!$auth['valid']) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$predictionModel = new PredictionModel($pdo);
$aiPredictor = new AIPredictor();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (empty($input['disaster_id']) || empty($input['data_points'])) {
            throw new Exception("Missing required parameters");
        }

        // Get historical data
        $historicalData = $predictionModel->getHistoricalData($input['disaster_id']);
        
        // Make prediction (AI/ML model)
        $prediction = $aiPredictor->predict(
            $input['data_points'], 
            $historicalData
        );

        // Save prediction
        $predictionId = $predictionModel->create([
            'disaster_id' => $input['disaster_id'],
            'prediction_data' => json_encode($prediction),
            'accuracy' => $aiPredictor->getLastAccuracy()
        ]);

        echo json_encode([
            'prediction_id' => $predictionId,
            'results' => $prediction,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function verifyToken() {
    $headers = getallheaders();
    $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    
    // Implement your JWT verification logic
    return ['valid' => !empty($token)]; // Simplified for example
}
?>