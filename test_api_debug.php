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
    ]
];

// Process URI similar to server/index.php
$basePath = '/giggles-tea';
if (strpos($parsedUri, $basePath) === 0) {
    $processedUri = substr($parsedUri, strlen($basePath));
    $debug['uri_processing']['after_removing_base_path'] = $processedUri;
} else {
    $processedUri = $parsedUri;
    $debug['uri_processing']['no_base_path_found'] = true;
}

// Ensure the URI starts with a slash for consistent matching
if ($processedUri === '' || $processedUri[0] !== '/') {
    $processedUri = '/' . $processedUri;
    $debug['uri_processing']['normalized_uri'] = $processedUri;
}

// Simulate router matching
$routes = [
    'GET /api/products' => 'api/products.php',
    'GET /api/products/' => 'api/products.php',
    'GET /api/products/[^/]+' => 'api/products.php',
];

$debug['route_matching']['looking_for'] = $requestMethod . ' ' . $processedUri;
$debug['route_matching']['tests'] = [];

foreach ($routes as $pattern => $file) {
    // Convert route pattern to regex pattern
    $regexPattern = str_replace('/', '\/', $pattern);
    $regexPattern = '/^' . str_replace('(\d+)', '(\d+)', $regexPattern) . '$/';
    
    $test_result = [
        'pattern' => $pattern,
        'regex' => $regexPattern,
        'testing_against' => $requestMethod . ' ' . $processedUri,
        'match' => preg_match($regexPattern, $requestMethod . ' ' . $processedUri, $matches) ? true : false
    ];
    
    if ($test_result['match']) {
        $test_result['matches'] = $matches;
        $debug['route_matching']['matched_handler'] = $file;
    }
    
    $debug['route_matching']['tests'][] = $test_result;
}

// Check for server/index.php in the URL
$debug['router_check'] = [
    'server_index_in_url' => strpos($parsedUri, '/server/index.php') !== false,
    'api_in_url' => strpos($parsedUri, '/api/') !== false,
    'htaccess_rewrite_check' => 'If you see this directly, .htaccess rewrite rule may not be working correctly'
];

echo json_encode($debug, JSON_PRETTY_PRINT);
