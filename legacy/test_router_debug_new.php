<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Router Debug Test</h1>";

// Simulate router environment
$requestMethod = 'GET';
$requestUri = '/api/products';
$debug = true;
$debugMessages = [];

// Define routes similar to server/index.php
$routes = [
    'GET /products' => 'api/products.php',
    'GET /products/' => 'api/products.php',
    'GET /products/[^/]+' => 'api/products.php',
    'POST /products' => 'api/products.php',
    'PUT /products/[^/]+' => 'api/products.php',
    'DELETE /products/(\d+)' => 'api/products.php',
    
    'GET /api/products' => 'api/products.php',
    'GET /api/products/' => 'api/products.php',
    'GET /api/products/[^/]+' => 'api/products.php',
    'POST /api/products' => 'api/products.php',
    'PUT /api/products/[^/]+' => 'api/products.php',
    'DELETE /api/products/(\d+)' => 'api/products.php',
];

// Find matching route
$handler = null;
$params = [];

echo "<h2>Route Matching</h2>";
echo "<p>Request: $requestMethod $requestUri</p>";

foreach ($routes as $pattern => $file) {
    // Convert route pattern to regex pattern
    $regexPattern = str_replace('/', '\/', $pattern);
    $regexPattern = '/^' . str_replace('(\d+)', '(\d+)', $regexPattern) . '$/';
    
    echo "<p>Checking pattern: $pattern against: $requestMethod $requestUri</p>";
    echo "<p>Regex pattern: $regexPattern</p>";
    
    if (preg_match($regexPattern, $requestMethod . ' ' . $requestUri, $matches)) {
        $handler = $file;
        $params = array_slice($matches, 1);
        echo "<p style='color:green;'>Match found! Handler: $handler</p>";
        break;
    }
}

if (!$handler) {
    echo "<p style='color:red;'>No matching route found</p>";
    exit;
}

// Test 1: Check if the handler file exists
echo "<h2>Test 1: Check if handler file exists</h2>";

$handlerPath = __DIR__ . '/' . $handler;
if (file_exists($handlerPath)) {
    echo "<p style='color:green;'>Handler file exists at: $handlerPath</p>";
} else {
    echo "<p style='color:red;'>Handler file does not exist at: $handlerPath</p>";
}

// Test 2: Check database connection
echo "<h2>Test 2: Check database connection</h2>";

try {
    require_once __DIR__ . '/server/config/database.php';
    
    if (isset($db) && $db) {
        echo "<p style='color:green;'>Database connection successful</p>";
        
        // Test query
        $query = "SELECT COUNT(*) as count FROM products";
        $result = mysqli_query($db, $query);
        
        if ($result) {
            $row = mysqli_fetch_assoc($result);
            echo "<p>Total products in database: " . $row['count'] . "</p>";
        } else {
            echo "<p style='color:red;'>Query failed: " . mysqli_error($db) . "</p>";
        }
    } else {
        echo "<p style='color:red;'>Database connection failed</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red;'>Error: " . $e->getMessage() . "</p>";
}

// Test 3: Simulate router handler inclusion
echo "<h2>Test 3: Simulate router handler inclusion</h2>";

try {
    // Save current output buffer
    ob_start();
    
    // Set up necessary variables for the handler
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_GET['featured'] = 'true';
    
    // Include the handler file with output buffering
    include $handlerPath;
    
    // Get the output
    $output = ob_get_clean();
    
    // Try to decode the JSON output
    $data = json_decode($output, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "<p>Handler executed successfully</p>";
        echo "<p>Response:</p>";
        echo "<pre>" . htmlspecialchars($output) . "</pre>";
        
        // Check if products were returned
        if (isset($data['data']) && is_array($data['data'])) {
            echo "<p>Products returned: " . count($data['data']) . "</p>";
        } else {
            echo "<p style='color:red;'>No products returned in response</p>";
        }
    } else {
        echo "<p style='color:red;'>Invalid JSON response: " . json_last_error_msg() . "</p>";
        echo "<p>Raw output:</p>";
        echo "<pre>" . htmlspecialchars($output) . "</pre>";
    }
} catch (Exception $e) {
    echo "<p style='color:red;'>Error: " . $e->getMessage() . "</p>";
}

// Test 4: Direct handler execution with modified include path
echo "<h2>Test 4: Direct handler execution with modified include path</h2>";

try {
    // Save current output buffer
    ob_start();
    
    // Set up necessary variables for the handler
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_GET['featured'] = 'true';
    
    // Include database connection directly
    require_once __DIR__ . '/server/config/database.php';
    
    // Include the handler file with output buffering
    include $handlerPath;
    
    // Get the output
    $output = ob_get_clean();
    
    // Try to decode the JSON output
    $data = json_decode($output, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "<p>Handler executed successfully</p>";
        echo "<p>Response:</p>";
        echo "<pre>" . htmlspecialchars($output) . "</pre>";
        
        // Check if products were returned
        if (isset($data['data']) && is_array($data['data'])) {
            echo "<p>Products returned: " . count($data['data']) . "</p>";
        } else {
            echo "<p style='color:red;'>No products returned in response</p>";
        }
    } else {
        echo "<p style='color:red;'>Invalid JSON response: " . json_last_error_msg() . "</p>";
        echo "<p>Raw output:</p>";
        echo "<pre>" . htmlspecialchars($output) . "</pre>";
    }
} catch (Exception $e) {
    echo "<p style='color:red;'>Error: " . $e->getMessage() . "</p>";
}
?>
