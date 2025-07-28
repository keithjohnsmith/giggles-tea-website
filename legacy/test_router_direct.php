<?php
// This script tests the router's handling of the products API directly

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to plain text for debugging
header('Content-Type: text/plain');

echo "=== Testing Router Direct Access ===\n\n";

// Define the router file path
$routerFile = __DIR__ . '/server/index.php';

// Test function
function testRouterEndpoint($method, $uri) {
    global $routerFile;
    
    echo "Testing router with method: $method, URI: $uri\n";
    
    // Save original globals
    $originalServer = $_SERVER;
    
    // Set up test environment
    $_SERVER['REQUEST_METHOD'] = $method;
    $_SERVER['REQUEST_URI'] = $uri;
    
    // Capture output
    ob_start();
    
    try {
        // Include the router file
        require $routerFile;
    } catch (Throwable $e) {
        echo "Exception caught: " . $e->getMessage() . "\n";
        echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
    }
    
    // Get the output
    $output = ob_get_clean();
    
    // Restore original globals
    $_SERVER = $originalServer;
    
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
        echo "Raw output (first 500 chars):\n";
        echo substr($output, 0, 500) . (strlen($output) > 500 ? "...[truncated]" : "") . "\n";
    } else if ($isJson) {
        echo "JSON data:\n";
        echo json_encode($jsonData, JSON_PRETTY_PRINT) . "\n";
    }
    
    echo "Test complete.\n\n";
}

// Test GET /api/products through the router
testRouterEndpoint('GET', '/giggles-tea/server/api/products');

echo "=== All Tests Complete ===\n";
