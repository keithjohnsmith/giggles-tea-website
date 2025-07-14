<?php
// Enable error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// Get request method and URI
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$parsedUri = parse_url($requestUri, PHP_URL_PATH);
$queryString = $_SERVER['QUERY_STRING'] ?? '';

// Debug information
$debug = [
    'timestamp' => date('Y-m-d H:i:s'),
    'request_info' => [
        'request_method' => $requestMethod,
        'full_request_uri' => $requestUri,
        'parsed_uri_path' => $parsedUri,
        'query_string' => $queryString,
    ],
    'server_info' => [
        'server_name' => $_SERVER['SERVER_NAME'],
        'script_name' => $_SERVER['SCRIPT_NAME'],
        'document_root' => $_SERVER['DOCUMENT_ROOT'],
    ]
];

echo json_encode($debug, JSON_PRETTY_PRINT);
