<?php
// Simple products API endpoint for testing
// Disable error output in the response
ini_set('display_errors', 0);
error_reporting(0);

// Set CORS headers for development
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database configuration
require_once __DIR__ . '/../server/config/database.php';

// Function to send JSON response
function sendResponse($success, $data = null, $error = null, $statusCode = 200) {
    http_response_code($statusCode);
    $response = [
        'success' => $success,
        'data' => $data,
        'error' => $error
    ];
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit();
}

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Simple query to get all products
        $query = "SELECT id, name, price FROM products LIMIT 10";
        $result = mysqli_query($db, $query);
        
        if (!$result) {
            sendResponse(false, null, 'Database query failed: ' . mysqli_error($db), 500);
        }
        
        $products = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $products[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'price' => (float)$row['price']
            ];
        }
        
        sendResponse(true, $products);
        
    } catch (Exception $e) {
        sendResponse(false, null, 'Internal server error: ' . $e->getMessage(), 500);
    }
} else {
    // Handle unsupported methods
    sendResponse(false, null, 'Method not allowed', 405);
}
