<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../models/RouteModel.php';
require_once __DIR__ . '/../libs/RouteOptimizer.php';

// Authenticate request
$auth = verifyToken();
if (!$auth['valid']) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$routeModel = new RouteModel($pdo);
$optimizer = new RouteOptimizer();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            $required = ['disaster_id', 'resource_type', 'quantity'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }

            // Get available resources
            $resources = $routeModel->getAvailableResources(
                $data['resource_type'], 
                $data['quantity']
            );

            // Get disaster location
            $disaster = $routeModel->getDisasterLocation($data['disaster_id']);

            // Optimize routes
            $optimizedRoutes = $optimizer->calculateRoutes(
                $resources,
                [
                    'latitude' => $disaster['latitude'],
                    'longitude' => $disaster['longitude']
                ],
                $data['quantity']
            );

            // Save optimized routes
            $routeId = $routeModel->saveOptimizedRoute(
                $data['disaster_id'],
                $data['resource_type'],
                $optimizedRoutes
            );

            echo json_encode([
                'route_id' => $routeId,
                'routes' => $optimizedRoutes,
                'estimated_time' => $optimizer->getLastEstimate()
            ]);
            break;

        case 'GET':
            $routeId = $_GET['id'] ?? null;
            if ($routeId) {
                $route = $routeModel->getRouteDetails($routeId);
                echo json_encode($route);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Route ID required']);
            }
            break;

        default:
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
    return ['valid' => !empty($token)]; // Simplified example
}
?>