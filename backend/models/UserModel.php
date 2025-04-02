<?php
class UserModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function createUser($username, $password, $role = 'responder') {
        $hashedPassword = password_hash($password . PEPPER, PASSWORD_BCRYPT);
        
        $stmt = $this->pdo->prepare("
            INSERT INTO users (username, password_hash, role) 
            VALUES (?, ?, ?)
        ");
        
        return $stmt->execute([$username, $hashedPassword, $role]);
    }

    public function getUserById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getUserByUsername($username) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>