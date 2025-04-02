<?php
class DroneModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("
            SELECT d.*, 
                   (SELECT COUNT(*) FROM drone_missions WHERE drone_id = d.id AND status = 'active') as active_missions
            FROM drones d
            WHERE d.status != 'decommissioned'
            ORDER BY d.last_activity DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare("
            SELECT * FROM drones 
            WHERE id = ? AND status != 'decommissioned'
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $required = ['name', 'model', 'max_capacity'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        $stmt = $this->pdo->prepare("
            INSERT INTO drones 
            (name, model, max_capacity, status, current_location, battery_level)
            VALUES (?, ?, ?, 'available', 'hangar', 100)
        ");

        $stmt->execute([
            $data['name'],
            $data['model'],
            $data['max_capacity']
        ]);

        return $this->pdo->lastInsertId();
    }

    public function update($id, $data) {
        $allowed = ['name', 'status', 'current_location', 'battery_level'];
        $updates = [];
        $params = [];

        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($updates)) {
            return 0;
        }

        $params[] = $id;
        $query = "UPDATE drones SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);

        return $stmt->rowCount();
    }

    public function deactivate($id) {
        $stmt = $this->pdo->prepare("
            UPDATE drones SET status = 'decommissioned' 
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }

    public function getAvailableDrones() {
        $stmt = $this->pdo->query("
            SELECT * FROM drones 
            WHERE status = 'available' AND battery_level > 20
            ORDER BY max_capacity DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>