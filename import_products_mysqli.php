<?php
/**
 * Product Data Import Script (MySQLi Version)
 * 
 * This script imports product data from the src/data/products.json.bak file
 * into the database, including product details and image paths.
 * Uses MySQLi instead of PDO to avoid driver issues.
 */

// Set error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Database connection parameters
$dbConfig = [
    'host' => 'localhost',
    'dbname' => 'giggles_tea',
    'username' => 'root',
    'password' => '', // Default XAMPP password is empty
    'charset' => 'utf8mb4'
];

// Function to log messages with timestamp
function logMessage($message) {
    echo date('[Y-m-d H:i:s] ') . $message . PHP_EOL;
}

// Function to get MySQLi connection
function getDbConnection() {
    global $dbConfig;
    
    // Create connection
    $mysqli = new mysqli(
        $dbConfig['host'],
        $dbConfig['username'],
        $dbConfig['password'],
        $dbConfig['dbname']
    );
    
    // Check connection
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    // Set charset
    $mysqli->set_charset($dbConfig['charset']);
    
    return $mysqli;
}

// Path to the product data JSON file
$jsonFilePath = __DIR__ . '/src/data/products.json.bak';

// Check if the file exists
if (!file_exists($jsonFilePath)) {
    logMessage("Error: Product data file not found at: $jsonFilePath");
    exit(1);
}

try {
    // Read and decode the JSON file
    logMessage("Reading product data from: $jsonFilePath");
    $jsonContent = file_get_contents($jsonFilePath);
    $products = json_decode($jsonContent, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON decode error: " . json_last_error_msg());
    }
    
    logMessage("Successfully decoded JSON data. Found " . count($products) . " products.");
    
    // Connect to the database
    logMessage("Connecting to database...");
    $mysqli = getDbConnection();
    logMessage("Database connection established.");
    
    // Start transaction
    $mysqli->begin_transaction();
    
    try {
        // Prepare statements for products and product_images tables
        $productStmt = $mysqli->prepare("
            INSERT INTO products 
            (id, name, german_name, description, price, category, is_active, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            german_name = VALUES(german_name),
            description = VALUES(description),
            price = VALUES(price),
            category = VALUES(category),
            updated_at = NOW()
        ");
        
        $imageStmt = $mysqli->prepare("
            INSERT INTO product_images
            (product_id, image_path, is_primary, created_at, updated_at)
            VALUES (?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
            is_primary = VALUES(is_primary),
            updated_at = NOW()
        ");
        
        // Counter for imported products
        $importedCount = 0;
        $imagesCount = 0;
        
        // Process each product
        foreach ($products as $product) {
            // Extract product data
            $id = isset($product['id']) ? $product['id'] : null;
            $name = isset($product['name']) ? $product['name'] : '';
            $germanName = isset($product['german_name']) ? $product['german_name'] : '';
            $description = isset($product['description']) ? $product['description'] : '';
            $price = isset($product['price']) ? $product['price'] : 0.00;
            $category = isset($product['category']) ? $product['category'] : '';
            
            // Skip if no ID
            if (empty($id)) {
                logMessage("Warning: Skipping product without ID: " . $name);
                continue;
            }
            
            // Insert/update product
            $productStmt->bind_param("ssssdss", $id, $name, $germanName, $description, $price, $category);
            $productStmt->execute();
            $importedCount++;
            
            // Process images if available
            if (isset($product['images']) && is_array($product['images'])) {
                foreach ($product['images'] as $index => $imagePath) {
                    // Skip empty paths
                    if (empty($imagePath)) continue;
                    
                    // Determine if this is the primary image (first one)
                    $isPrimary = ($index === 0) ? 1 : 0;
                    
                    // Insert/update image
                    $imageStmt->bind_param("ssi", $id, $imagePath, $isPrimary);
                    $imageStmt->execute();
                    $imagesCount++;
                }
            }
        }
        
        // Commit transaction
        $mysqli->commit();
        logMessage("Import completed successfully. Imported $importedCount products and $imagesCount images.");
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $mysqli->rollback();
        throw $e;
    } finally {
        // Close prepared statements
        if (isset($productStmt)) $productStmt->close();
        if (isset($imageStmt)) $imageStmt->close();
        
        // Close database connection
        $mysqli->close();
    }
    
} catch (Exception $e) {
    logMessage("Error: " . $e->getMessage());
    exit(1);
}
