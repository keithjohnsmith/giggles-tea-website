<?php
/**
 * Check Products Script
 * 
 * This script checks if products were successfully imported into the database
 * by querying the products table and displaying the count and some sample data.
 */

// Set error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Function to log messages with timestamp
function logMessage($message) {
    echo date('[Y-m-d H:i:s] ') . $message . PHP_EOL;
}

// Database connection parameters
$host = 'localhost';
$dbname = 'giggles_tea';
$username = 'root';
$password = ''; // Default XAMPP password is empty

try {
    logMessage("Connecting to database...");
    
    // Create connection using MySQLi
    $mysqli = new mysqli($host, $username, $password, $dbname);
    
    // Check connection
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    logMessage("Database connection established.");
    
    // Check products table
    $result = $mysqli->query("SELECT COUNT(*) as count FROM products");
    if ($result) {
        $row = $result->fetch_assoc();
        $productCount = $row['count'];
        logMessage("Found $productCount products in the database.");
    } else {
        logMessage("Error querying products table: " . $mysqli->error);
    }
    
    // Get sample products
    if ($productCount > 0) {
        $sampleResult = $mysqli->query("SELECT id, name, category, price FROM products LIMIT 5");
        if ($sampleResult) {
            logMessage("Sample products:");
            while ($product = $sampleResult->fetch_assoc()) {
                logMessage("  ID: {$product['id']}, Name: {$product['name']}, Category: {$product['category']}, Price: {$product['price']}");
            }
        }
    }
    
    // Check product_images table
    $imageResult = $mysqli->query("SELECT COUNT(*) as count FROM product_images");
    if ($imageResult) {
        $row = $imageResult->fetch_assoc();
        $imageCount = $row['count'];
        logMessage("Found $imageCount product images in the database.");
    } else {
        logMessage("Error querying product_images table: " . $mysqli->error);
    }
    
    // Close connection
    $mysqli->close();
    logMessage("Database connection closed.");
    
} catch (Exception $e) {
    logMessage("Error: " . $e->getMessage());
}
