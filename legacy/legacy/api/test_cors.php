<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Return only the headers and not the content
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    http_response_code(204);
    exit();
}

// Simple response to test CORS
$response = [
    'success' => true,
    'message' => 'CORS test successful',
    'timestamp' => date('Y-m-d H:i:s'),
    'headers_sent' => headers_list()
];

echo json_encode($response, JSON_PRETTY_PRINT);
