<?php
// Enable error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start output buffering to capture all output
ob_start();

// Increase memory limit to handle larger responses
ini_set('memory_limit', '256M');

// Set execution time limit to avoid timeouts
set_time_limit(120);

// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication

/* 
// For production, use specific origins instead of wildcard:
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://giggles-tea.com'  // Add your production domain when ready
];

// Get the origin of the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Set CORS headers based on origin
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Max-Age: 86400"); // 24 hours cache for preflight requests
}
*/

// Set content type for non-OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
    header("Content-Type: application/json; charset=UTF-8");
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request method and URI
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Output debugging information directly to the response for development
$debug = true;

// Store debug messages
$debugMessages = [];
$debugMessages[] = "Original URI: " . $requestUri;

// Remove the base path if it exists
// For local development with XAMPP, the path might include /giggles-tea/api
// The .htaccess rule rewrites /api/* to server/index.php
$basePath = '/giggles-tea/api';
if (strpos($requestUri, $basePath) === 0) {
    $requestUri = substr($requestUri, strlen($basePath));
    $debugMessages[] = "After removing base path: " . $requestUri;
} else {
    // Alternative path if the request comes through server/index.php directly
    $altBasePath = '/giggles-tea/server';
    if (strpos($requestUri, $altBasePath) === 0) {
        $requestUri = substr($requestUri, strlen($altBasePath));
        $debugMessages[] = "After removing alternate base path: " . $requestUri;
    }
}

// Ensure the URI starts with a slash for consistent matching
if ($requestUri === '' || $requestUri[0] !== '/') {
    $requestUri = '/' . $requestUri;
    $debugMessages[] = "Normalized URI: " . $requestUri;
}

// Simple router
$routes = [
    // Products routes - handle both with and without /api prefix
    'GET /products' => 'api/products.php',
    'GET /products/' => 'api/products.php',
    'GET /products/[^/]+' => 'api/products.php',  // Match any product ID
    'POST /products' => 'api/products.php',
    'PUT /products/[^/]+' => 'api/products.php',  // Match any product ID
    'DELETE /products/(\d+)' => 'api/products.php',
    
    'GET /api/products' => 'api/products.php',
    'GET /api/products/' => 'api/products.php',
    'GET /api/products/[^/]+' => 'api/products.php',  // Match any product ID
    'POST /api/products' => 'api/products.php',
    'PUT /api/products/[^/]+' => 'api/products.php',  // Match any product ID
    'DELETE /api/products/(\d+)' => 'api/products.php',
    
    // Fixed products routes
    'GET /products_fixed' => 'api/products_fixed.php',
    'GET /products_fixed/' => 'api/products_fixed.php',
    'GET /products_fixed/[^/]+' => 'api/products_fixed.php',
    
    'GET /api/products_fixed' => 'api/products_fixed.php',
    'GET /api/products_fixed/' => 'api/products_fixed.php',
    'GET /api/products_fixed/[^/]+' => 'api/products_fixed.php',
    
    // Simple products routes
    'GET /products_simple' => '../api/products_simple.php',
    'GET /api/products_simple' => '../api/products_simple.php',
    
    // Other routes
    'GET /image' => '../image.php',
    'POST /api/auth/login' => 'auth.php',
    'GET /api/cart' => 'cart.php',
    'POST /api/cart' => 'cart.php',
    'PUT /api/cart' => 'cart.php',
    'DELETE /api/cart' => 'cart.php',
    'GET /api/orders' => 'orders.php',
    'GET /api/orders/(\d+)' => 'orders.php',
    'POST /api/orders' => 'orders.php',
];

// Find matching route
$handler = null;
$params = [];

// Remove query string from URI for route matching
$requestUriWithoutQuery = preg_replace('/\?.*$/', '', $requestUri);
$debugMessages[] = "URI without query string: " . $requestUriWithoutQuery;

$debugMessages[] = "Looking for route match for: " . $requestMethod . ' ' . $requestUriWithoutQuery;

foreach ($routes as $pattern => $file) {
    // Convert route pattern to regex pattern
    $regexPattern = str_replace('/', '\/', $pattern);
    $regexPattern = '/^' . str_replace('(\d+)', '(\d+)', $regexPattern) . '$/';
    
    $debugMessages[] = "Checking pattern: " . $pattern . " against: " . $requestMethod . ' ' . $requestUriWithoutQuery;
    $debugMessages[] = "Regex pattern: " . $regexPattern;
    
    if (preg_match($regexPattern, $requestMethod . ' ' . $requestUriWithoutQuery, $matches)) {
        $handler = $file;
        $params = array_slice($matches, 1);
        break;
    }
}

// Include the handler file if found
if ($handler) {
    try {
        // Check if the handler is a full path (like '../image.php')
        if (strpos($handler, '../') === 0) {
            $handlerPath = dirname(__DIR__) . '/' . substr($handler, 3);
            if (file_exists($handlerPath)) {
                require_once __DIR__ . '/config/database.php';
                require_once __DIR__ . '/utils/Response.php';
                
                // Get request data
                $requestData = json_decode(file_get_contents('php://input'), true) ?? [];
                
                // Capture output from the handler file
                ob_start();
                include $handlerPath;
                $output = ob_get_clean();
                
                // Send the output
                echo $output;
                exit;
            }
        } 
        // Check if the file exists in the server directory
        else if (file_exists(__DIR__ . '/' . $handler)) {
            require_once __DIR__ . '/config/database.php';
            require_once __DIR__ . '/utils/Response.php';
            
            // Get request data
            $requestData = json_decode(file_get_contents('php://input'), true) ?? [];
            
            // Capture output from the handler file
            ob_start();
            include __DIR__ . '/' . $handler;
            $output = ob_get_clean();
            
            // Send the output
            echo $output;
            exit;
        }
    } catch (Exception $e) {
        // Handle exceptions
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Server error: ' . $e->getMessage(),
            'debug' => $debug ? [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ] : null
        ]);
        exit;
    }
} else {
    // 404 Not Found
    http_response_code(404);
    
    $response = [
        'status' => 'error',
        'message' => 'Endpoint not found',
        'path' => $requestUri
    ];
    
    // Include debug information in development mode
    if ($debug) {
        $response['debug'] = [
            'messages' => $debugMessages,
            'request_method' => $requestMethod,
            'request_uri' => $requestUri,
            'available_routes' => array_keys($routes)
        ];
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
}
