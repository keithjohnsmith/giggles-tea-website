<?php
/**
 * Test API Endpoint
 * 
 * This script tests the API endpoint to ensure it's returning product data correctly.
 */

// Set error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "=== TESTING API ENDPOINT ===\n\n";

// URL of the API endpoint
$apiUrl = 'http://localhost/giggles-tea/api/products.php';

// Make a request to the API endpoint
echo "Making request to: $apiUrl\n";
$response = file_get_contents($apiUrl);

if ($response === false) {
    echo "Error: Failed to make request to API endpoint.\n";
    exit(1);
}

// Decode the JSON response
$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo "Error decoding JSON response: " . json_last_error_msg() . "\n";
    exit(1);
}

// Display the response
echo "API Response:\n";
echo "Status: " . ($data['success'] ? 'Success' : 'Failed') . "\n";
echo "Total Products: " . count($data['products']) . "\n\n";

// Display the first product
if (!empty($data['products'])) {
    echo "First Product:\n";
    $product = $data['products'][0];
    echo "ID: " . $product['id'] . "\n";
    echo "Name: " . $product['name'] . "\n";
    echo "Category: " . $product['category'] . "\n";
    
    // Display images
    if (!empty($product['images'])) {
        echo "Images:\n";
        foreach ($product['images'] as $image) {
            echo "  - " . $image . "\n";
        }
    }
}

echo "\n=== API TEST COMPLETED ===\n";
