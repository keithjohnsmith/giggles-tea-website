<?php
// This script tests the products API with detailed error reporting

// Disable output buffering to see all output
ob_end_clean();

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to plain text for debugging
header('Content-Type: text/plain');

echo "=== Testing Products API (Detailed) ===\n\n";

// Test database connection
echo "Testing database connection...\n";
require_once __DIR__ . '/server/config/database.php';
echo "Database connection successful.\n\n";

// Define a function to test the API directly
function testApiEndpoint($method, $uri) {
    echo "Testing API with method: $method, URI: $uri\n";
    
    // Save original globals
    $originalServer = $_SERVER;
    $originalGet = $_GET;
    $originalPost = $_POST;
    $originalRequest = $_REQUEST;
    
    // Set up test environment
    $_SERVER['REQUEST_METHOD'] = $method;
    $_SERVER['REQUEST_URI'] = $uri;
    
    // Capture all output
    ob_start();
    
    try {
        // Include the API file
        require __DIR__ . '/server/api/products.php';
    } catch (Throwable $e) {
        echo "Exception caught: " . $e->getMessage() . "\n";
        echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
        echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    }
    
    // Get the output
    $output = ob_get_clean();
    
    // Restore original globals
    $_SERVER = $originalServer;
    $_GET = $originalGet;
    $_POST = $originalPost;
    $_REQUEST = $originalRequest;
    
    // Check if output is valid JSON
    $isJson = false;
    $jsonData = null;
    
    if (!empty($output)) {
        // Try to decode as JSON
        $jsonData = json_decode($output);
        $isJson = (json_last_error() === JSON_ERROR_NONE);
    }
    
    // Display results
    echo "Output is " . ($isJson ? "valid" : "invalid") . " JSON.\n";
    if (!$isJson && !empty($output)) {
        echo "JSON error: " . json_last_error_msg() . "\n";
        echo "Raw output:\n";
        echo $output . "\n";
    } else if ($isJson) {
        echo "JSON data:\n";
        echo json_encode($jsonData, JSON_PRETTY_PRINT) . "\n";
    }
    
    echo "Test complete.\n\n";
}

// Test GET /api/products
testApiEndpoint('GET', '/api/products');

// Test OPTIONS /api/products
testApiEndpoint('OPTIONS', '/api/products');

echo "=== All Tests Complete ===\n";
