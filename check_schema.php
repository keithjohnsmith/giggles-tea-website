<?php
/**
 * Database Schema Check Script
 * 
 * This script checks the structure of the products table to help diagnose
 * schema mismatches between the API and the database.
 */

// Include database configuration
require_once __DIR__ . '/server/config/database.php';

// Function to print table structure
function printTableStructure($db, $tableName) {
    echo "Structure of table '$tableName':\n";
    
    $query = "DESCRIBE $tableName";
    $result = mysqli_query($db, $query);
    
    if (!$result) {
        echo "Error: " . mysqli_error($db) . "\n";
        return;
    }
    
    echo "+-----------------+-------------+------+-----+---------+----------------+\n";
    echo "| Field           | Type        | Null | Key | Default | Extra          |\n";
    echo "+-----------------+-------------+------+-----+---------+----------------+\n";
    
    while ($row = mysqli_fetch_assoc($result)) {
        printf("| %-15s | %-11s | %-4s | %-3s | %-7s | %-14s |\n",
            $row['Field'],
            $row['Type'],
            $row['Null'],
            $row['Key'],
            $row['Default'] ?? 'NULL',
            $row['Extra']
        );
    }
    
    echo "+-----------------+-------------+------+-----+---------+----------------+\n";
}

// Function to list all tables in the database
function listTables($db) {
    echo "Tables in database:\n";
    
    $query = "SHOW TABLES";
    $result = mysqli_query($db, $query);
    
    if (!$result) {
        echo "Error: " . mysqli_error($db) . "\n";
        return;
    }
    
    echo "+------------------------+\n";
    echo "| Tables                 |\n";
    echo "+------------------------+\n";
    
    while ($row = mysqli_fetch_array($result)) {
        printf("| %-22s |\n", $row[0]);
    }
    
    echo "+------------------------+\n";
}

// Main execution
echo "Checking database schema...\n\n";

// List all tables
listTables($db);
echo "\n";

// Check products table structure
printTableStructure($db, 'products');
echo "\n";

// Check product_images table structure
printTableStructure($db, 'product_images');
echo "\n";

// Check categories table structure if it exists
$result = mysqli_query($db, "SHOW TABLES LIKE 'categories'");
if (mysqli_num_rows($result) > 0) {
    printTableStructure($db, 'categories');
    echo "\n";
}

// Check product_categories table structure if it exists
$result = mysqli_query($db, "SHOW TABLES LIKE 'product_categories'");
if (mysqli_num_rows($result) > 0) {
    printTableStructure($db, 'product_categories');
    echo "\n";
}

echo "Schema check complete.\n";
?>
