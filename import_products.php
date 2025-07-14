<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'giggles_tea';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Successfully connected to MySQL server\n";

// Check if products table exists, if not create it
$tableCheckSql = "SHOW TABLES LIKE 'products'";
$tableResult = $conn->query($tableCheckSql);

if ($tableResult->num_rows == 0) {
    // Create products table
    $createTableSql = "CREATE TABLE IF NOT EXISTS `products` (
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
    
    if ($conn->query($createTableSql) === TRUE) {
        echo "Table 'products' created successfully\n";
    } else {
        die("Error creating table: " . $conn->error);
    }
}

// Read the JSON data from the backup file
$jsonFile = __DIR__ . '/src/data/products.json.bak';
$jsonData = file_get_contents($jsonFile);

if ($jsonData === false) {
    die("Error reading JSON file: $jsonFile\n");
}

$products = json_decode($jsonData, true);

if ($products === null) {
    die("Error decoding JSON data: " . json_last_error_msg() . "\n");
}

echo "Found " . count($products) . " products in the JSON file\n";

// Prepare the SQL statement for inserting products
$stmt = $conn->prepare("INSERT INTO products (name, description, price, image_url, category, is_active) VALUES (?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    die("Error preparing statement: " . $conn->error . "\n");
}

// Bind parameters
$stmt->bind_param("ssdssi", $name, $description, $price, $image_url, $category, $is_active);

// Counter for successful imports
$successCount = 0;

// Insert each product
foreach ($products as $product) {
    // Extract product data
    $name = $product['name'];
    $description = isset($product['description']) ? $product['description'] : '';
    $price = $product['price'];
    
    // Get the first image if there are multiple
    if (isset($product['images']) && is_array($product['images']) && count($product['images']) > 0) {
        $image_url = $product['images'][0];
    } else {
        $image_url = isset($product['image']) ? $product['image'] : '';
    }
    
    // Get the English category if available, otherwise use the German one
    $category = isset($product['category_en']) ? $product['category_en'] : $product['category'];
    
    // Set is_active
    $is_active = isset($product['isActive']) ? ($product['isActive'] ? 1 : 0) : 1;
    
    // Execute the statement
    if ($stmt->execute()) {
        $successCount++;
    } else {
        echo "Error inserting product '$name': " . $stmt->error . "\n";
    }
}

// Close statement and connection
$stmt->close();
$conn->close();

echo "Successfully imported $successCount out of " . count($products) . " products\n";
echo "Import completed!\n";
?>
