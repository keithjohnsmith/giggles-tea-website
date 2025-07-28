<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
require_once __DIR__ . '/config/database.php';

echo "Testing database connection...\n";

if ($db) {
    echo "✅ Successfully connected to database\n";
    
    // Check if products table exists
    $result = mysqli_query($db, "SHOW TABLES LIKE 'products'");
    if (mysqli_num_rows($result) > 0) {
        echo "✅ Products table exists\n";
        
        // Check columns in products table
        $columns = [];
        $result = mysqli_query($db, "DESCRIBE products");
        while ($row = mysqli_fetch_assoc($result)) {
            $columns[] = $row['Field'];
        }
        
        $requiredColumns = ['id', 'name', 'german_name', 'price', 'description', 'category', 'category_en', 'category_id', 'is_active'];
        $missingColumns = array_diff($requiredColumns, $columns);
        
        if (empty($missingColumns)) {
            echo "✅ All required columns exist in products table\n";
            
            // Check if images column exists
            if (in_array('images', $columns)) {
                echo "✅ Images column exists in products table\n";
            } else {
                echo "⚠️ Images column is missing from products table\n";
                
                // Add images column if it doesn't exist
                $alterQuery = "ALTER TABLE `products` ADD `images` TEXT NULL AFTER `is_active`";
                if (mysqli_query($db, $alterQuery)) {
                    echo "✅ Added images column to products table\n";
                } else {
                    echo "❌ Failed to add images column: " . mysqli_error($db) . "\n";
                }
            }
        } else {
            echo "❌ Missing required columns in products table: " . implode(', ', $missingColumns) . "\n";
        }
    } else {
        echo "❌ Products table does not exist\n";
    }
    
    // Check if product_versions table exists
    $result = mysqli_query($db, "SHOW TABLES LIKE 'product_versions'");
    if (mysqli_num_rows($result) > 0) {
        echo "✅ Product versions table exists\n";
    } else {
        echo "⚠️ Product versions table does not exist, creating...\n";
        
        $createTable = "CREATE TABLE `product_versions` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `product_id` varchar(50) NOT NULL,
            `version_data` longtext NOT NULL,
            `created_at` datetime NOT NULL,
            PRIMARY KEY (`id`),
            KEY `product_id` (`product_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        
        if (mysqli_query($db, $createTable)) {
            echo "✅ Created product_versions table\n";
        } else {
            echo "❌ Failed to create product_versions table: " . mysqli_error($db) . "\n";
        }
    }
    
    // Check if product_categories table exists
    $result = mysqli_query($db, "SHOW TABLES LIKE 'product_categories'");
    if (mysqli_num_rows($result) > 0) {
        echo "✅ Product categories table exists\n";
    } else {
        echo "❌ Product categories table does not exist. This table is required for product-category relationships.\n";
    }
    
    // Check if categories table exists
    $result = mysqli_query($db, "SHOW TABLES LIKE 'categories'");
    if (mysqli_num_rows($result) > 0) {
        echo "✅ Categories table exists\n";
    } else {
        echo "❌ Categories table does not exist. This table is required for product categories.\n";
    }
    
} else {
    echo "❌ Failed to connect to database\n";
    echo "Error: " . mysqli_connect_error() . "\n";
}

echo "\nDatabase test complete.\n";
