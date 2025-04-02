<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '../config/db.php';
require_once __DIR__ . '../config/constants.php';
require_once __DIR__ . '../models/DroneModel.php';

// Authenticate request
$auth = verifyToken();
if (!$auth['valid']) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$droneModel = new DroneModel($pdo);

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $id = $_GET['id'] ?? null;
    
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get single drone
                $drone = $droneModel->getById($id);
                echo json_encode($drone ?: ['error' => 'Drone not found']);
            } else {
                // List all drones
                $drones = $droneModel->getAll();
                echo json_encode($drones);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $droneModel->create($data);
            echo json_encode(['id' => $id, 'message' => 'Drone created']);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $affected = $droneModel->update($id, $data);
            echo json_encode(['affected' => $affected, 'message' => 'Drone updated']);
            break;
            
        case 'DELETE':
            $affected = $droneModel->deactivate($id);
            echo json_encode(['affected' => $affected, 'message' => 'Drone deactivated']);
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
    
    // Implement your JWT verification logic here
    // This is a simplified example:
    if ($token === 'valid_token_example') {
        return ['valid' => true, 'user_id' => 1];
    }
    return ['valid' => false];
}
?>