<?php
class DisasterModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("
            SELECT d.*, COUNT(r.id) as resource_count 
            FROM disasters d
            LEFT JOIN resources r ON d.id = r.disaster_id
            GROUP BY d.id
            ORDER BY d.severity DESC, d.created_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare("
            SELECT * FROM disasters 
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $required = ['type', 'location', 'severity'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        $stmt = $this->pdo->prepare("
            INSERT INTO disasters 
            (type, location, latitude, longitude, severity, description, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['type'],
            $data['location'],
            $data['latitude'] ?? null,
            $data['longitude'] ?? null,
            $data['severity'],
            $data['description'] ?? '',
            $data['status'] ?? 'active',
            $data['created_by'] ?? null
        ]);

        return $this->pdo->lastInsertId();
    }

    public function update($id, $data) {
        $allowed = ['type', 'location', 'latitude', 'longitude', 'severity', 'description', 'status'];
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
        $query = "UPDATE disasters SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);

        return $stmt->rowCount();
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("
            UPDATE disasters SET status = 'archived' 
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
?>