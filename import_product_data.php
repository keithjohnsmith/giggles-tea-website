<?php
/**
 * Product Data Import Script
 * 
 * This script imports product data from the src/data/products.json.bak file
 * into the database, including product details and image paths.
 */

// Include database configuration
require_once __DIR__ . '/server/config/database.php';

// Set error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Function to log messages with timestamp
function logMessage($message) {
    echo date('[Y-m-d H:i:s] ') . $message . PHP_EOL;
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
    $pdo = getDbConnection();
    logMessage("Database connection established.");
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        // Prepare statements for products and product_images tables
        $productStmt = $pdo->prepare("
            INSERT INTO products (
                id, name, german_name, description, price, 
                category_en, category_de, is_active, status
            ) VALUES (
                :id, :name, :german_name, :description, :price, 
                :category_en, :category_de, :is_active, 'active'
            ) ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                german_name = VALUES(german_name),
                description = VALUES(description),
                price = VALUES(price),
                category_en = VALUES(category_en),
                category_de = VALUES(category_de),
                is_active = VALUES(is_active),
                status = VALUES(status)
        ");
        
        $imageStmt = $pdo->prepare("
            INSERT INTO product_images (
                product_id, image_path, is_primary, position, created_at, updated_at
            ) VALUES (
                :product_id, :image_path, :is_primary, :position, NOW(), NOW()
            ) ON DUPLICATE KEY UPDATE
                is_primary = VALUES(is_primary),
                position = VALUES(position),
                updated_at = NOW()
        ");
        
        // First, delete existing product images to prevent duplicates
        logMessage("Clearing existing product images...");
        $pdo->exec("DELETE FROM product_images");
        
        // Process each product
        $importedCount = 0;
        $errorCount = 0;
        
        foreach ($products as $index => $product) {
            try {
                // Insert or update product
                $productStmt->execute([
                    ':id' => $product['id'],
                    ':name' => $product['name'],
                    ':german_name' => $product['germanName'] ?? null,
                    ':description' => $product['description'] ?? '',
                    ':price' => $product['price'],
                    ':category_en' => $product['category_en'] ?? null,
                    ':category_de' => $product['category'] ?? null,
                    ':is_active' => isset($product['isActive']) ? ($product['isActive'] ? 1 : 0) : 1
                ]);
                
                // Insert product images
                if (isset($product['images']) && is_array($product['images'])) {
                    foreach ($product['images'] as $position => $imagePath) {
                        // Determine if this is the primary image (first one)
                        $isPrimary = ($position === 0) ? 1 : 0;
                        
                        $imageStmt->execute([
                            ':product_id' => $product['id'],
                            ':image_path' => $imagePath,
                            ':is_primary' => $isPrimary,
                            ':position' => $position
                        ]);
                    }
                }
                
                $importedCount++;
                
                // Log progress every 10 products
                if ($importedCount % 10 === 0) {
                    logMessage("Processed $importedCount products...");
                }
            } catch (PDOException $e) {
                logMessage("Error processing product ID {$product['id']}: " . $e->getMessage());
                $errorCount++;
            }
        }
        
        // Commit transaction
        $pdo->commit();
        
        logMessage("Import completed. Successfully imported $importedCount products with " . 
                  ($errorCount > 0 ? "$errorCount errors." : "no errors."));
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $pdo->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    logMessage("Error: " . $e->getMessage());
    exit(1);
}

logMessage("Product import process completed.");
