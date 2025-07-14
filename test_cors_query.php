<?php
// Enable error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set CORS headers for direct API access - allow any origin for development
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type for non-OPTIONS requests
header("Content-Type: application/json; charset=UTF-8");

// Echo back the query parameters to verify they're received
$response = [
    'status' => 'success',
    'message' => 'CORS test with query parameters',
    'query_params' => $_GET,
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'request_uri' => $_SERVER['REQUEST_URI']
];

echo json_encode($response);
