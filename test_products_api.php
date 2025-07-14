<?php
// This script tests the products API directly to identify any issues

// Disable output buffering to see all output
ob_end_clean();

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to plain text for debugging
header('Content-Type: text/plain');

echo "=== Testing Products API ===\n\n";

// Test database connection
echo "Testing database connection...\n";
require_once __DIR__ . '/server/config/database.php';
echo "Database connection successful.\n\n";

// Test including the products API file directly
echo "Testing products API file...\n";
try {
    // Simulate a GET request
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/api/products';
    
    // Include the API file with output buffering to capture any output
    ob_start();
    require_once __DIR__ . '/server/api/products.php';
    $output = ob_get_clean();
    
    echo "API file included successfully.\n";
    echo "API output:\n";
    echo $output;
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
