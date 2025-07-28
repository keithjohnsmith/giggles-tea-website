<?php
// This script will show all headers that are being sent by the server
header("Content-Type: application/json; charset=UTF-8");

// Get all headers that would be sent
$headers = [];
foreach (headers_list() as $header) {
    $parts = explode(':', $header, 2);
    if (count($parts) === 2) {
        $name = trim($parts[0]);
        $value = trim($parts[1]);
        $headers[$name] = $value;
    }
}

// Add server information
$serverInfo = [
    'PHP_VERSION' => PHP_VERSION,
    'SERVER_SOFTWARE' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'Unknown',
    'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'Unknown',
    'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'Unknown',
    'SCRIPT_FILENAME' => $_SERVER['SCRIPT_FILENAME'] ?? 'Unknown',
];

// Return all information as JSON
echo json_encode([
    'headers' => $headers,
    'server_info' => $serverInfo,
    'apache_modules' => function_exists('apache_get_modules') ? apache_get_modules() : 'Function not available',
    'all_headers' => headers_list(),
], JSON_PRETTY_PRINT);
