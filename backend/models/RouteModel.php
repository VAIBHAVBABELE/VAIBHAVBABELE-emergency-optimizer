<?php
class RouteModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAvailableResources($type, $minQuantity) {
        $stmt = $this->pdo->prepare("
            SELECT 
                w.id, 
                w.name, 
                w.latitude, 
                w.longitude,
                i.quantity,
                i.updated_at
            FROM warehouses w
            JOIN inventory i ON w.id = i.warehouse_id
            WHERE i.item_type = ? 
            AND i.quantity >= ?
            AND w.status = 'active'
            ORDER BY i.updated_at DESC
        ");
        $stmt->execute([$type, $minQuantity]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDisasterLocation($disasterId) {
        $stmt = $this->pdo->prepare("
            SELECT latitude, longitude 
            FROM disasters 
            WHERE id = ?
        ");
        $stmt->execute([$disasterId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function saveOptimizedRoute($disasterId, $resourceType, $routes) {
        $stmt = $this->pdo->prepare("
            INSERT INTO optimized_routes
            (disaster_id, resource_type, route_data, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([
            $disasterId,
            $resourceType,
            json_encode($routes)
        ]);
        return $this->pdo->lastInsertId();
    }

    public function getRouteDetails($routeId) {
        $stmt = $this->pdo->prepare("
            SELECT * FROM optimized_routes
            WHERE id = ?
        ");
        $stmt->execute([$routeId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>