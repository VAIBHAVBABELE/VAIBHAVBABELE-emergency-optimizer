<?php
    header("Access-Control-Allow-Origin: *"); // Or your specific domain like "http://localhost:3000"
    header("Access-Control-Allow-Headers: Authorization, Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header('Content-Type: application/json'); // Keep this as your second header
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
require_once __DIR__ . '../config/db.php';
require_once __DIR__ . '../config/constants.php';
require_once __DIR__ . '../models/DisasterModel.php';

// Authenticate request
$auth = verifyToken();
if (!$auth['valid']) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$disasterModel = new DisasterModel($pdo);

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $id = $_GET['id'] ?? null;
    
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get single disaster
                $disaster = $disasterModel->getById($id);
                if ($disaster) {
                    echo json_encode($disaster);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Disaster not found']);
                }
            } else {
                // List all disasters
                $disasters = $disasterModel->getAll();
                echo json_encode($disasters);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $disasterModel->create($data);
            echo json_encode(['id' => $id, 'message' => 'Disaster created']);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $affected = $disasterModel->update($id, $data);
            echo json_encode(['affected' => $affected, 'message' => 'Disaster updated']);
            break;
            
        case 'DELETE':
            $affected = $disasterModel->delete($id);
            echo json_encode(['affected' => $affected, 'message' => 'Disaster deleted']);
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
    // Implement your JWT verification logic here
    return ['valid' => true, 'user_id' => 1]; // Simplified for example
}
?>