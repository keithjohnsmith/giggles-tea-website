<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once __DIR__ . '/server/config/database.php';

// Set headers
header('Content-Type: text/plain'); // Use plain text for better debug readability

echo "=== Status Check ===\n";

// Check if products table has any products with status = 'active'
$activeQuery = "SELECT COUNT(*) as active_count FROM products WHERE status = 'active'";
$activeResult = mysqli_query($db, $activeQuery);
$activeCount = mysqli_fetch_assoc($activeResult)['active_count'];

echo "Products with status 'active': $activeCount\n\n";

// Update all products to have status = 'active'
$updateQuery = "UPDATE products SET status = 'active' WHERE status = 'draft'";
if (mysqli_query($db, $updateQuery)) {
    $affectedRows = mysqli_affected_rows($db);
    echo "Updated $affectedRows products from 'draft' to 'active' status\n\n";
} else {
    echo "Error updating products: " . mysqli_error($db) . "\n\n";
}

// Verify the update
$verifyQuery = "SELECT COUNT(*) as active_count FROM products WHERE status = 'active'";
$verifyResult = mysqli_query($db, $verifyQuery);
$verifyCount = mysqli_fetch_assoc($verifyResult)['active_count'];

echo "Products with status 'active' after update: $verifyCount\n\n";

echo "=== Update Complete ===\n";
?>
