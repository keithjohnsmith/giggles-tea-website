<?php
/**
 * Giggles Tea - Database Restoration Test Script
 * 
 * This script tests the restored database structure and connections.
 */

// Include database configuration
$dbConfig = require_once __DIR__ . '/server/config/database.php';

// Display page header
echo "<!DOCTYPE html>
<html>
<head>
    <title>Giggles Tea - Database Restoration Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        h1 { color: #2c3e50; }
        h2 { color: #3498db; margin-top: 20px; }
        .success { color: #27ae60; }
        .error { color: #e74c3c; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Giggles Tea - Database Restoration Test</h1>";

// Test database connection
try {
    $dsn = "mysql:host={$dbConfig['host']};dbname={$dbConfig['dbname']};charset={$dbConfig['charset']}";
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], $dbConfig['options']);
    echo "<p class='success'>✓ Database connection successful!</p>";
} catch (PDOException $e) {
    echo "<p class='error'>✗ Database connection failed: " . $e->getMessage() . "</p>";
    exit;
}

// Function to check if a table exists and count its rows
function checkTable($pdo, $tableName) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM `$tableName`");
        $count = $stmt->fetchColumn();
        return [
            'exists' => true,
            'count' => $count,
            'error' => null
        ];
    } catch (PDOException $e) {
        return [
            'exists' => false,
            'count' => 0,
            'error' => $e->getMessage()
        ];
    }
}

// List of tables to check
$tables = [
    'products',
    'product_images',
    'categories',
    'product_variants',
    'orders',
    'order_items',
    'cart_items',
    'users',
    'reviews',
    'tags',
    'addresses',
    'product_categories'
];

// Check each table
echo "<h2>Table Status</h2>";
echo "<table>
        <tr>
            <th>Table Name</th>
            <th>Status</th>
            <th>Row Count</th>
        </tr>";

$allTablesExist = true;

foreach ($tables as $table) {
    $result = checkTable($pdo, $table);
    echo "<tr>";
    echo "<td>$table</td>";
    
    if ($result['exists']) {
        echo "<td class='success'>Exists</td>";
        echo "<td>{$result['count']}</td>";
    } else {
        echo "<td class='error'>Missing: {$result['error']}</td>";
        echo "<td>N/A</td>";
        $allTablesExist = false;
    }
    
    echo "</tr>";
}

echo "</table>";

// If all tables exist, perform some additional tests
if ($allTablesExist) {
    // Test product retrieval
    echo "<h2>Sample Product Data</h2>";
    try {
        $stmt = $pdo->query("SELECT p.*, GROUP_CONCAT(pi.image_path) as image_paths 
                            FROM products p 
                            LEFT JOIN product_images pi ON p.id = pi.product_id 
                            GROUP BY p.id 
                            LIMIT 5");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($products) > 0) {
            echo "<table>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Images</th>
                    </tr>";
            
            foreach ($products as $product) {
                echo "<tr>";
                echo "<td>{$product['id']}</td>";
                echo "<td>{$product['name']}</td>";
                echo "<td>{$product['price']}</td>";
                echo "<td>{$product['category_en'] ?? $product['category_id']}</td>";
                
                // Display image paths
                echo "<td>";
                if (!empty($product['image_paths'])) {
                    $paths = explode(',', $product['image_paths']);
                    foreach ($paths as $index => $path) {
                        echo htmlspecialchars($path) . "<br>";
                        // Only show first 3 images
                        if ($index >= 2 && count($paths) > 3) {
                            echo "... and " . (count($paths) - 3) . " more";
                            break;
                        }
                    }
                } else {
                    echo "No images";
                }
                echo "</td>";
                
                echo "</tr>";
            }
            
            echo "</table>";
        } else {
            echo "<p>No products found in the database.</p>";
        }
    } catch (PDOException $e) {
        echo "<p class='error'>Error retrieving products: " . $e->getMessage() . "</p>";
    }
    
    // Test category retrieval
    echo "<h2>Sample Category Data</h2>";
    try {
        $stmt = $pdo->query("SELECT * FROM categories LIMIT 5");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($categories) > 0) {
            echo "<table>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Name (EN)</th>
                        <th>Name (DE)</th>
                    </tr>";
            
            foreach ($categories as $category) {
                echo "<tr>";
                echo "<td>{$category['id']}</td>";
                echo "<td>{$category['name']}</td>";
                echo "<td>{$category['name_en'] ?? 'N/A'}</td>";
                echo "<td>{$category['name_de'] ?? 'N/A'}</td>";
                echo "</tr>";
            }
            
            echo "</table>";
        } else {
            echo "<p>No categories found in the database.</p>";
        }
    } catch (PDOException $e) {
        echo "<p class='error'>Error retrieving categories: " . $e->getMessage() . "</p>";
    }
    
    // Test image path validation
    echo "<h2>Image Path Validation</h2>";
    try {
        $stmt = $pdo->query("SELECT DISTINCT image_path FROM product_images LIMIT 10");
        $imagePaths = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "<table>
                <tr>
                    <th>Image Path</th>
                    <th>File Exists</th>
                </tr>";
        
        foreach ($imagePaths as $path) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($path) . "</td>";
            
            $fullPath = __DIR__ . '/' . $path;
            if (file_exists($fullPath)) {
                echo "<td class='success'>Yes</td>";
            } else {
                echo "<td class='error'>No</td>";
            }
            
            echo "</tr>";
        }
        
        echo "</table>";
    } catch (PDOException $e) {
        echo "<p class='error'>Error validating image paths: " . $e->getMessage() . "</p>";
    }
}

// Display PHP and MySQL information
echo "<h2>Environment Information</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";

try {
    $stmt = $pdo->query("SELECT VERSION() as version");
    $mysqlVersion = $stmt->fetchColumn();
    echo "<p><strong>MySQL Version:</strong> " . $mysqlVersion . "</p>";
} catch (PDOException $e) {
    echo "<p class='error'>Error getting MySQL version: " . $e->getMessage() . "</p>";
}

echo "<p><strong>PDO Drivers:</strong> " . implode(', ', PDO::getAvailableDrivers()) . "</p>";

// Check for mysqli extension
if (extension_loaded('mysqli')) {
    echo "<p class='success'><strong>mysqli Extension:</strong> Loaded</p>";
} else {
    echo "<p class='error'><strong>mysqli Extension:</strong> Not loaded</p>";
}

echo "</body></html>";
