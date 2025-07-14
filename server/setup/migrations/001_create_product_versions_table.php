<?php
// Check if product_versions table exists and create if it doesn't
function createProductVersionsTable($db) {
    $query = "CREATE TABLE IF NOT EXISTS `product_versions` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `product_id` varchar(50) NOT NULL,
        `version_data` longtext NOT NULL,
        `created_at` datetime NOT NULL,
        PRIMARY KEY (`id`),
        KEY `product_id` (`product_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    
    if (mysqli_query($db, $query)) {
        return true;
    } else {
        error_log("Error creating product_versions table: " . mysqli_error($db));
        return false;
    }
}

// Check if images column exists in products table and add if it doesn't
function checkProductsTable($db) {
    $query = "SHOW COLUMNS FROM `products` LIKE 'images'";
    $result = mysqli_query($db, $query);
    
    if (mysqli_num_rows($result) === 0) {
        $alterQuery = "ALTER TABLE `products` ADD `images` TEXT NULL AFTER `is_active`";
        if (!mysqli_query($db, $alterQuery)) {
            error_log("Error adding images column to products table: " . mysqli_error($db));
            return false;
        }
    }
    return true;
}

// Run migrations
require_once __DIR__ . '/../../config/database.php';

if (!isset($db)) {
    die("Database connection not available");
}

$success = true;
$success = $success && createProductVersionsTable($db);
$success = $success && checkProductsTable($db);

echo $success ? "Migrations completed successfully\n" : "Some migrations failed. Check error log.\n";
