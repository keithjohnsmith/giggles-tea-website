<?php
/**
 * Product Data Import Script (MySQLi Version) - FIXED
 * 
 * This script imports product data from the src/data/products.json.bak file
 * into the database, including product details and image paths.
 * Adjusted to match the actual database table structure.
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

// Function to create a slug from a name
function createSlug($name) {
    // Convert to lowercase and replace spaces with hyphens
    $slug = strtolower(trim($name));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    return trim($slug, '-');
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
            (id, name, german_name, slug, category_en, category_de, is_featured, 
            requires_shipping, is_gift_card, is_active, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, 0, 1, 0, 1, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            german_name = VALUES(german_name),
            slug = VALUES(slug),
            category_en = VALUES(category_en),
            category_de = VALUES(category_de),
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
            $id = isset($product['id']) ? intval($product['id']) : null; // Convert to integer
            $name = isset($product['name']) ? $product['name'] : '';
            $germanName = isset($product['german_name']) ? $product['german_name'] : '';
            $slug = createSlug($name);
            $category = isset($product['category']) ? $product['category'] : '';
            $categoryEn = $category; // Use the same category for English
            $categoryDe = $category; // Use the same category for German
            
            // Skip if no ID
            if (empty($id)) {
                logMessage("Warning: Skipping product without ID: " . $name);
                continue;
            }
            
            // Insert/update product
            $productStmt->bind_param("isssss", $id, $name, $germanName, $slug, $categoryEn, $categoryDe);
            $result = $productStmt->execute();
            
            if (!$result) {
                logMessage("Error inserting product: " . $mysqli->error);
                continue;
            }
            
            $importedCount++;
            logMessage("Imported product: $id - $name");
            
            // Process images if available
            if (isset($product['images']) && is_array($product['images'])) {
                foreach ($product['images'] as $index => $imagePath) {
                    // Skip empty paths
                    if (empty($imagePath)) continue;
                    
                    // Determine if this is the primary image (first one)
                    $isPrimary = ($index === 0) ? 1 : 0;
                    
                    // Insert/update image
                    $imageStmt->bind_param("isi", $id, $imagePath, $isPrimary);
                    $imageResult = $imageStmt->execute();
                    
                    if (!$imageResult) {
                        logMessage("Error inserting image: " . $mysqli->error);
                        continue;
                    }
                    
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
