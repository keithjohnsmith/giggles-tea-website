<?php
// Enable error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Force PHP to send headers immediately
ob_start();

header("Content-Type: application/json; charset=UTF-8");

// Get request method and URI
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$queryString = parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY);

// Debug information
$debug = [
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'request_method' => $requestMethod,
        'request_uri' => $_SERVER['REQUEST_URI'],
        'parsed_uri' => $requestUri,
        'query_string' => $queryString,
        'server_name' => $_SERVER['SERVER_NAME'],
        'php_self' => $_SERVER['PHP_SELF'],
        'script_name' => $_SERVER['SCRIPT_NAME'],
        'script_filename' => $_SERVER['SCRIPT_FILENAME'],
        'document_root' => $_SERVER['DOCUMENT_ROOT'],
    ]
];

// Remove the base path if it exists
$basePath = '/giggles-tea';
if (strpos($requestUri, $basePath) === 0) {
    $requestUri = substr($requestUri, strlen($basePath));
    $debug['uri_processing']['after_removing_base_path'] = $requestUri;
}

// Ensure the URI starts with a slash for consistent matching
if ($requestUri === '' || $requestUri[0] !== '/') {
    $requestUri = '/' . $requestUri;
    $debug['uri_processing']['normalized_uri'] = $requestUri;
}

// Simple router - just for testing
$routes = [
    'GET /api/products' => 'api/products.php',
    'GET /api/products/' => 'api/products.php',
    'GET /api/products/[^/]+' => 'api/products.php',  // Match any product ID
];

// Find matching route
$handler = null;
$params = [];

$debug['route_matching']['looking_for'] = $requestMethod . ' ' . $requestUri;
$debug['route_matching']['tests'] = [];

foreach ($routes as $pattern => $file) {
    // Convert route pattern to regex pattern
    $regexPattern = str_replace('/', '\/', $pattern);
    $regexPattern = '/^' . str_replace('(\d+)', '(\d+)', $regexPattern) . '$/';
    
    $test_result = [
        'pattern' => $pattern,
        'regex' => $regexPattern,
        'testing_against' => $requestMethod . ' ' . $requestUri,
        'match' => preg_match($regexPattern, $requestMethod . ' ' . $requestUri, $matches) ? true : false
    ];
    
    if ($test_result['match']) {
        $test_result['matches'] = $matches;
        $handler = $file;
        $params = array_slice($matches, 1);
    }
    
    $debug['route_matching']['tests'][] = $test_result;
}

$debug['route_matching']['result'] = [
    'handler' => $handler,
    'params' => $params
];

// Output debug information
echo json_encode($debug, JSON_PRETTY_PRINT);
