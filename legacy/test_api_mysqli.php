<?php
/**
 * Test API Endpoint (MySQLi Version)
 * 
 * This script tests the MySQLi version of the API endpoint to ensure it's returning product data correctly.
 */

// Set error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "=== TESTING MYSQLI API ENDPOINT ===\n\n";

// URL of the API endpoint
$apiUrl = 'http://localhost/giggles-tea/api/products_mysqli.php';

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
echo "Total Products: " . $data['total'] . "\n";
echo "Products returned: " . count($data['products']) . "\n\n";

// Display the first product
if (!empty($data['products'])) {
    echo "First Product:\n";
    $product = $data['products'][0];
    echo "ID: " . $product['id'] . "\n";
    echo "Name: " . $product['name'] . "\n";
    echo "German Name: " . $product['german_name'] . "\n";
    echo "Category: " . $product['category'] . "\n";
    echo "Price: $" . $product['price'] . "\n";
    
    // Display images
    if (!empty($product['images'])) {
        echo "Images:\n";
        foreach ($product['images'] as $image) {
            echo "  - " . $image . "\n";
        }
    }
    
    echo "Primary Image: " . $product['primary_image'] . "\n";
}

echo "\n=== API TEST COMPLETED ===\n";
