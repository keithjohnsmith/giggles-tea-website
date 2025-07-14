<?php
// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'giggles_tea';

// Create connection without database
$conn = new mysqli($db_host, $db_user, $db_pass);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Successfully connected to MySQL server\n";

// Create database if not exists
$sql = "CREATE DATABASE IF NOT EXISTS `$db_name`";
if ($conn->query($sql) === TRUE) {
    echo "Database '$db_name' created or already exists\n";
} else {
    die("Error creating database: " . $conn->error);
}

// Select the database
$conn->select_db($db_name);

// SQL to create products table
$sql = "CREATE TABLE IF NOT EXISTS `products` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL,
    `image_url` VARCHAR(255),
    `category` VARCHAR(100),
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "Table 'products' created or already exists\n";
    
    // Check if table is empty and insert sample data
    $result = $conn->query("SELECT COUNT(*) as count FROM `products`");
    $row = $result->fetch_assoc();
    
    if ($row['count'] == 0) {
        echo "Adding sample products...\n";
        
        $sample_products = [
            ["Earl Grey", "Classic black tea with bergamot oil", 4.99, "earl-grey.jpg", "Black Tea"],
            ["Jasmine Green", "Delicate green tea with jasmine flowers", 5.99, "jasmine-green.jpg", "Green Tea"],
            ["Chamomile", "Soothing herbal tea with chamomile flowers", 3.99, "chamomile.jpg", "Herbal Tea"]
        ];
        
        $stmt = $conn->prepare("INSERT INTO `products` (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)");
        
        foreach ($sample_products as $product) {
            $stmt->bind_param("ssdss", $product[0], $product[1], $product[2], $product[3], $product[4]);
            if ($stmt->execute()) {
                echo "Added: " . $product[0] . "\n";
            } else {
                echo "Error adding product: " . $conn->error . "\n";
            }
        }
        $stmt->close();
    }
} else {
    echo "Error creating table: " . $conn->error . "\n";
}

$conn->close();
echo "Database setup completed!\n";
?>
