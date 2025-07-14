<?php
// Simple script to view products in the database

// Set error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "=== GIGGLES TEA DATABASE CHECK ===\n\n";

try {
    // Connect to database using MySQLi
    echo "Connecting to database...\n";
    $mysqli = new mysqli('localhost', 'root', '', 'giggles_tea');
    
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "Connection successful!\n\n";
    
    // Check products table
    $result = $mysqli->query("SELECT COUNT(*) as count FROM products");
    $row = $result->fetch_assoc();
    echo "Total products in database: " . $row['count'] . "\n\n";
    
    // Get sample products
    echo "Sample products:\n";
    echo "----------------\n";
    $products = $mysqli->query("SELECT id, name, category, price FROM products LIMIT 5");
    
    if ($products->num_rows > 0) {
        while ($product = $products->fetch_assoc()) {
            echo "ID: " . $product['id'] . "\n";
            echo "Name: " . $product['name'] . "\n";
            echo "Category: " . $product['category'] . "\n";
            echo "Price: $" . $product['price'] . "\n";
            echo "----------------\n";
        }
    } else {
        echo "No products found.\n";
    }
    
    // Check product_images table
    $imageResult = $mysqli->query("SELECT COUNT(*) as count FROM product_images");
    $imageRow = $imageResult->fetch_assoc();
    echo "\nTotal product images in database: " . $imageRow['count'] . "\n";
    
    // Close connection
    $mysqli->close();
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
