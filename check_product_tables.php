<?php
// Script to check if product tables exist and their structure

// Set error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "=== GIGGLES TEA PRODUCT TABLES CHECK ===\n\n";

try {
    // Connect to database using MySQLi
    echo "Connecting to database...\n";
    $mysqli = new mysqli('localhost', 'root', '', 'giggles_tea');
    
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "Connection successful!\n\n";
    
    // Check if products table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'products'");
    if ($result && $result->num_rows > 0) {
        echo "Products table exists.\n";
        
        // Show table structure
        echo "Products table structure:\n";
        $columns = $mysqli->query("DESCRIBE products");
        if ($columns && $columns->num_rows > 0) {
            while ($column = $columns->fetch_assoc()) {
                echo "  " . $column['Field'] . " (" . $column['Type'] . ")\n";
            }
        }
    } else {
        echo "Products table does not exist!\n";
    }
    
    echo "\n";
    
    // Check if product_images table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'product_images'");
    if ($result && $result->num_rows > 0) {
        echo "Product_images table exists.\n";
        
        // Show table structure
        echo "Product_images table structure:\n";
        $columns = $mysqli->query("DESCRIBE product_images");
        if ($columns && $columns->num_rows > 0) {
            while ($column = $columns->fetch_assoc()) {
                echo "  " . $column['Field'] . " (" . $column['Type'] . ")\n";
            }
        }
    } else {
        echo "Product_images table does not exist!\n";
    }
    
    // Close connection
    $mysqli->close();
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
