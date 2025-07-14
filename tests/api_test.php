<?php
/**
 * API Test Script
 * 
 * Run this script to test the API endpoints:
 * php tests/api_test.php
 */

// Test configuration
$baseUrl = 'http://localhost:8000/api';
$testProduct = [
    'name' => 'Test Product ' . uniqid(),
    'description' => 'This is a test product',
    'price' => 9.99,
    'category' => 'Test Category',
    'stock' => 10
];

/**
 * Make an HTTP request
 */
function makeRequest($method, $endpoint, $data = null) {
    global $baseUrl;
    
    $url = $baseUrl . $endpoint;
    $ch = curl_init($url);
    
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
    ];
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($method === 'POST' || $method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        die('Curl error: ' . curl_error($ch));
    }
    
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'body' => json_decode($response, true) ?: $response
    ];
}

/**
 * Run a test case
 */
function runTest($name, $callback) {
    echo "\n\n=== $name ===\n";
    $result = $callback();
    
    if ($result['success']) {
        echo "✅ PASSED: {$result['message']}\n";
        if (isset($result['data'])) {
            echo "   Data: " . json_encode($result['data'], JSON_PRETTY_UNICODE) . "\n";
        }
    } else {
        echo "❌ FAILED: {$result['message']}\n";
        if (isset($result['error'])) {
            echo "   Error: " . json_encode($result['error'], JSON_PRETTY_UNICODE) . "\n";
        }
    }
}

// Test 1: Get all products
runTest('Get All Products', function() {
    $response = makeRequest('GET', '/products');
    
    return [
        'success' => $response['code'] === 200 && is_array($response['body']),
        'message' => 'Should return an array of products',
        'data' => $response['body']
    ];
});

// Test 2: Create a new product
$createdProduct = null;
runTest('Create Product', function() use (&$createdProduct, $testProduct) {
    $response = makeRequest('POST', '/products', $testProduct);
    
    $success = $response['code'] === 201 && isset($response['body']['id']);
    
    if ($success) {
        $createdProduct = $response['body'];
    }
    
    return [
        'success' => $success,
        'message' => 'Should create a new product',
        'data' => $response['body']
    ];
});

// Test 3: Get single product
runTest('Get Single Product', function() use (&$createdProduct) {
    if (!$createdProduct) {
        return [
            'success' => false,
            'message' => 'Skipped - No product created',
            'error' => 'Create product test must pass first'
        ];
    }
    
    $response = makeRequest('GET', "/products/{$createdProduct['id']}");
    
    return [
        'success' => $response['code'] === 200 && $response['body']['id'] === $createdProduct['id'],
        'message' => 'Should return the created product',
        'data' => $response['body']
    ];
});

// Test 4: Update product
runTest('Update Product', function() use (&$createdProduct) {
    if (!$createdProduct) {
        return [
            'success' => false,
            'message' => 'Skipped - No product to update',
            'error' => 'Create product test must pass first'
        ];
    }
    
    $updateData = [
        'name' => $createdProduct['name'] . ' Updated',
        'price' => $createdProduct['price'] + 1
    ];
    
    $response = makeRequest('PUT', "/products/{$createdProduct['id']}", $updateData);
    
    $success = $response['code'] === 200 && 
               $response['body']['name'] === $updateData['name'] && 
               $response['body']['price'] === $updateData['price'];
    
    if ($success) {
        $createdProduct = $response['body'];
    }
    
    return [
        'success' => $success,
        'message' => 'Should update the product',
        'data' => $response['body']
    ];
});

// Test 5: Get categories
runTest('Get Categories', function() {
    $response = makeRequest('GET', '/categories');
    
    return [
        'success' => $response['code'] === 200 && is_array($response['body']),
        'message' => 'Should return an array of categories',
        'data' => $response['body']
    ];
});

// Test 6: Delete product
runTest('Delete Product', function() use (&$createdProduct) {
    if (!$createdProduct) {
        return [
            'success' => false,
            'message' => 'Skipped - No product to delete',
            'error' => 'Create product test must pass first'
        ];
    }
    
    $response = makeRequest('DELETE', "/products/{$createdProduct['id']}");
    
    // Verify the product was deleted by trying to fetch it
    $verifyResponse = makeRequest('GET', "/products/{$createdProduct['id']}");
    
    return [
        'success' => $response['code'] === 200 && 
                   $verifyResponse['code'] === 404,
        'message' => 'Should delete the product',
        'data' => $response['body']
    ];
});

echo "\n\n=== API Testing Complete ===\n";
