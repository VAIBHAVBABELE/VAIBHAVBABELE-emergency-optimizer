CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'coordinator', 'responder') NOT NULL DEFAULT 'responder',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample admin user (password: Admin@123)
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

CREATE TABLE disasters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('flood', 'earthquake', 'hurricane', 'wildfire', 'tsunami') NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    severity TINYINT NOT NULL CHECK (severity BETWEEN 1 AND 10),
    description TEXT,
    status ENUM('active', 'contained', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disaster_id INT NOT NULL REFERENCES disasters(id),
    type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    status ENUM('requested', 'dispatched', 'delivered') DEFAULT 'requested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(50) NOT NULL,
    max_capacity DECIMAL(10,2) NOT NULL COMMENT 'kg',
    status ENUM('available', 'in_mission', 'maintenance', 'decommissioned') DEFAULT 'available',
    current_location VARCHAR(100),
    battery_level TINYINT UNSIGNED DEFAULT 100,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE drone_missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drone_id INT NOT NULL,
    disaster_id INT NOT NULL,
    status ENUM('pending', 'active', 'completed', 'failed') DEFAULT 'pending',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    payload TEXT,
    FOREIGN KEY (drone_id) REFERENCES drones(id),
    FOREIGN KEY (disaster_id) REFERENCES disasters(id)
);

CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disaster_id INT NOT NULL,
    prediction_data JSON NOT NULL,
    accuracy DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disaster_id) REFERENCES disasters(id)
);

CREATE TABLE disaster_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disaster_id INT NOT NULL,
    resource_usage JSON NOT NULL,
    weather_conditions VARCHAR(255),
    population_density DECIMAL(10,2),
    response_times INT COMMENT 'In minutes',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disaster_id) REFERENCES disasters(id)
);

CREATE TABLE warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    status ENUM('active', 'maintenance', 'closed') DEFAULT 'active'
);

CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE TABLE optimized_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disaster_id INT NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    route_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disaster_id) REFERENCES disasters(id)
);