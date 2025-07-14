<?php
/**
 * Giggles Tea API Test Script
 * 
 * This script helps test the API endpoints for the Giggles Tea website.
 * Run this file in your browser or via command line to test the API.
 * 
 * Note: This version uses file_get_contents instead of cURL for better compatibility.
 */

// Configuration
$baseUrl = 'http://localhost:8000/server';
$testEmail = 'test@example.com';
$testPassword = 'password';
$testProduct = [
    'code' => 'TEST' . uniqid(),
    'name' => 'Test Product',
    'germanName' => 'Testprodukt',
    'category' => 'Test Category',
    'category_de' => 'Testkategorie',
    'price' => 9.99,
    'description' => 'This is a test product',
    'images' => [
        ['url' => 'https://via.placeholder.com/300', 'alt' => 'Test Image 1'],
        ['url' => 'https://via.placeholder.com/300', 'alt' => 'Test Image 2']
    ]
];

// Test results array
$results = [];

/**
 * Make an API request using file_get_contents
 */
function makeRequest($method, $endpoint, $data = null, $token = null) {
    global $baseUrl, $results;
    
    $url = $baseUrl . $endpoint;
    $options = [
        'http' => [
            'method' => $method,
            'header' => [
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            'ignore_errors' => true // To get HTTP status code even on failure
        ]
    ];
    
    // Add Authorization header if token is provided
    if ($token) {
        $options['http']['header'][] = 'Authorization: Bearer ' . $token;
    }
    
    // Add request body if provided
    if ($data !== null) {
        $jsonData = json_encode($data);
        $options['http']['content'] = $jsonData;
        $options['http']['header'][] = 'Content-Length: ' . strlen($jsonData);
    }
    
    // Convert headers array to the format needed by stream_context_create
    $options['http']['header'] = implode("\r\n", $options['http']['header']);
    
    $context = stream_context_create($options);
    
    try {
        $response = @file_get_contents($url, false, $context);
        
        // Get HTTP status code from the response headers
        $statusLine = $http_response_header[0];
        preg_match('{HTTP\/\S*\s(\d{3})}', $statusLine, $match);
        $httpCode = isset($match[1]) ? (int)$match[1] : 500;
        
        $contentType = '';
        foreach ($http_response_header as $header) {
            if (stripos($header, 'Content-Type:') === 0) {
                $contentType = $header;
                break;
            }
        }
        
        $result = [
            'status' => $httpCode,
            'content_type' => $contentType,
            'response' => json_decode($response, true) ?: $response,
            'error' => $httpCode >= 400 ? $statusLine : null
        ];
        
        return $result;
        
    } catch (Exception $e) {
        return [
            'status' => 500,
            'content_type' => 'text/plain',
            'response' => ['error' => $e->getMessage()],
            'error' => $e->getMessage()
        ];
    }
}

/**
 * Run a test case
 */
function runTest($name, $callback) {
    global $results;
    
    echo "Running test: $name... ";
    
    try {
        $result = $callback();
        $results[] = [
            'test' => $name,
            'status' => 'PASS',
            'result' => $result
        ];
        echo "PASS\n";
    } catch (Exception $e) {
        $results[] = [
            'test' => $name,
            'status' => 'FAIL',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ];
        echo "FAIL - " . $e->getMessage() . "\n";
    }
}

// Check if running in CLI or browser
$isCli = (php_sapi_name() === 'cli');

if (!$isCli) {
    echo "<pre>\n";
}

echo "=== Giggles Tea API Test ===\n\n";

// Test 1: Check API is running
runTest('API Status', function() {
    $result = makeRequest('GET', '/api/products');
    
    if ($result['status'] !== 200) {
        throw new Exception("API returned status code: " . $result['status']);
    }
    
    return $result['response'];
});

// Test 2: Register a test user (if your API has registration)
$testUser = [
    'email' => $testEmail,
    'password' => $testPassword,
    'name' => 'Test User'
];

runTest('User Registration', function() use ($testUser) {
    // Skip if registration endpoint doesn't exist
    $result = makeRequest('POST', '/api/auth/register', $testUser);
    
    // 201 Created or 400 if user already exists are both acceptable
    if (!in_array($result['status'], [201, 400])) {
        throw new Exception("Unexpected status code: " . $result['status']);
    }
    
    return $result['response'];
});

// Test 3: Login
$authToken = null;

runTest('User Login', function() use ($testEmail, $testPassword, &$authToken) {
    $result = makeRequest('POST', '/api/auth/login', [
        'email' => $testEmail,
        'password' => $testPassword
    ]);
    
    if ($result['status'] !== 200) {
        throw new Exception("Login failed with status: " . $result['status']);
    }
    
    if (empty($result['response']['token'])) {
        throw new Exception("No token in response");
    }
    
    $authToken = $result['response']['token'];
    return ['token_received' => !empty($authToken)];
});

// Test 4: Create a product (requires authentication)
$createdProductId = null;

runTest('Create Product', function() use (&$createdProductId, $testProduct, $authToken) {
    if (!$authToken) {
        throw new Exception("No auth token available");
    }
    
    $result = makeRequest('POST', '/api/products', $testProduct, $authToken);
    
    if ($result['status'] !== 201) {
        throw new Exception("Failed to create product: " . json_encode($result['response']));
    }
    
    if (empty($result['response']['id'])) {
        throw new Exception("No product ID in response");
    }
    
    $createdProductId = $result['response']['id'];
    return ['product_id' => $createdProductId];
});

// Test 5: Get product by ID
runTest('Get Product by ID', function() use ($createdProductId, $authToken) {
    if (!$createdProductId) {
        throw new Exception("No product ID available");
    }
    
    $result = makeRequest('GET', "/api/products/$createdProductId", null, $authToken);
    
    if ($result['status'] !== 200) {
        throw new Exception("Failed to get product: " . $result['status']);
    }
    
    return ['product' => $result['response']];
});

// Test 6: Add product to cart
runTest('Add to Cart', function() use ($createdProductId, $authToken) {
    if (!$createdProductId) {
        throw new Exception("No product ID available");
    }
    
    $result = makeRequest('POST', '/api/cart', [
        'product_id' => $createdProductId,
        'quantity' => 1
    ], $authToken);
    
    if (!in_array($result['status'], [200, 201])) {
        throw new Exception("Failed to add to cart: " . $result['status']);
    }
    
    return $result['response'];
});

// Test 7: Get cart
runTest('Get Cart', function() use ($authToken) {
    $result = makeRequest('GET', '/api/cart', null, $authToken);
    
    if ($result['status'] !== 200) {
        throw new Exception("Failed to get cart: " . $result['status']);
    }
    
    return ['cart' => $result['response']];
});

// Test 8: Create order
runTest('Create Order', function() use ($authToken) {
    $result = makeRequest('POST', '/api/orders', [
        'shipping_address' => [
            'name' => 'Test User',
            'street' => '123 Test St',
            'city' => 'Test City',
            'postal_code' => '12345',
            'country' => 'Test Country'
        ],
        'billing_address' => [
            'name' => 'Test User',
            'street' => '123 Test St',
            'city' => 'Test City',
            'postal_code' => '12345',
            'country' => 'Test Country'
        ],
        'payment_method' => 'credit_card',
        'notes' => 'Test order'
    ], $authToken);
    
    if ($result['status'] !== 201) {
        throw new Exception("Failed to create order: " . json_encode($result['response']));
    }
    
    return $result['response'];
});

// Display results
echo "\n=== Test Results ===\n";

foreach ($results as $test) {
    $status = $test['status'];
    $color = ($status === 'PASS') ? "\033[0;32m" : "\033[0;31m";
    $reset = "\033[0m";
    
    if ($isCli) {
        echo "{$color}[{$status}]{$reset} {$test['test']}\n";
    } else {
        echo "<span style='color: " . (($status === 'PASS') ? 'green' : 'red') . "'>";
        echo "[{$status}] {$test['test']}</span><br>\n";
    }
    
    if (isset($test['error'])) {
        echo "  Error: " . $test['error'] . "\n";
    }
}

if (!$isCli) {
    echo "</pre>";
}

echo "\nTesting complete.\n";
