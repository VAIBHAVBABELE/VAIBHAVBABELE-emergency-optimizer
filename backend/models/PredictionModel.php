<?php
class PredictionModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getHistoricalData($disasterId) {
        $stmt = $this->pdo->prepare("
            SELECT 
                resource_usage,
                weather_conditions,
                population_density,
                response_times
            FROM disaster_history
            WHERE disaster_id = ?
            ORDER BY recorded_at DESC
            LIMIT 100
        ");
        $stmt->execute([$disasterId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO predictions 
            (disaster_id, prediction_data, accuracy, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([
            $data['disaster_id'],
            $data['prediction_data'],
            $data['accuracy'] ?? null
        ]);
        return $this->pdo->lastInsertId();
    }

    public function getLatest($disasterId) {
        $stmt = $this->pdo->prepare("
            SELECT * FROM predictions
            WHERE disaster_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        ");
        $stmt->execute([$disasterId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>