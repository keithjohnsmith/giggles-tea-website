<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for API response
header("Content-Type: application/json; charset=UTF-8");

// Include database configuration
require_once __DIR__ . '/../server/config/database.php';

// Function to send JSON response in the expected format
function sendResponse($status, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    $response = [
        'status' => $status,
        'message' => $message,
        'data' => $data
    ];
    echo json_encode($response);
    exit();
}

// Check database connection
if (!$db || !mysqli_ping($db)) {
    sendResponse('error', 'Database connection failed', null, 500);
}

// Get pagination parameters
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 12;
$offset = ($page - 1) * $limit;

// Check for featured filter
$featuredFilter = isset($_GET['featured']) && $_GET['featured'] === 'true' ? "AND p.is_featured = '1'" : "";

// Check for product ID filter
$idFilter = "";
if (isset($_GET['id'])) {
    $id = mysqli_real_escape_string($db, $_GET['id']);
    $idFilter = "AND p.id = '$id'";
}

// Base query - IMPORTANT: Removed status filter to show all products
$baseQuery = "FROM products p
             LEFT JOIN product_categories pc ON p.id = pc.product_id
             LEFT JOIN categories c ON pc.category_id = c.id
             LEFT JOIN product_images pi ON p.id = pi.product_id
             WHERE p.is_active = '1' $featuredFilter $idFilter";

// Get total count for pagination
$countQuery = "SELECT COUNT(DISTINCT p.id) as total $baseQuery";
$countResult = mysqli_query($db, $countQuery);
if (!$countResult) {
    sendResponse('error', 'Database error: ' . mysqli_error($db), null, 500);
}

$total = (int)mysqli_fetch_assoc($countResult)['total'];

// Get products with pagination and related data
$query = "SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT CONCAT_WS('|', c.id, c.name_en, c.name_de) SEPARATOR ';;') as category_info,
            GROUP_CONCAT(DISTINCT pi.image_path SEPARATOR ';;') as image_paths
          $baseQuery
          GROUP BY p.id
          ORDER BY p.name ASC
          LIMIT $limit OFFSET $offset";

$result = mysqli_query($db, $query);
if (!$result) {
    sendResponse('error', 'Database error: ' . mysqli_error($db), null, 500);
}

// Process product rows
$products = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Process categories
    $categories = [];
    if (!empty($row['category_info'])) {
        $categoryItems = explode(';;', $row['category_info']);
        foreach ($categoryItems as $item) {
            if (!empty($item)) {
                $parts = explode('|', $item);
                if (count($parts) >= 3) {
                    $categories[] = [
                        'id' => $parts[0],
                        'name_en' => $parts[1],
                        'name_de' => $parts[2]
                    ];
                }
            }
        }
    }
    
    // Process images
    $images = [];
    if (!empty($row['image_paths'])) {
        $imagePaths = explode(';;', $row['image_paths']);
        foreach ($imagePaths as $path) {
            if (!empty($path)) {
                $images[] = $path;
            }
        }
    }
    
    // Build product data
    $product = [
        'id' => $row['id'],
        'name' => $row['name'],
        'price' => (float)($row['price'] ?? 0),
        'description_en' => $row['description_en'] ?? $row['description'] ?? '',
        'description_de' => $row['description_de'] ?? '',
        'is_active' => $row['is_active'] === '1',
        'is_featured' => $row['is_featured'] === '1',
        'sku' => $row['sku'] ?? '',
        'stock' => (int)($row['stock'] ?? 0),
        'categories' => $categories,
        'images' => $images,
        'image' => !empty($images[0]) ? $images[0] : null
    ];
    
    $products[] = $product;
}

// Calculate pagination info
$totalPages = $limit > 0 ? ceil($total / $limit) : 1;
$currentPage = $page;

// Prepare response with pagination info
$responseData = [
    'data' => $products,
    'pagination' => [
        'total' => $total,
        'page' => $currentPage,
        'limit' => $limit,
        'pages' => $totalPages
    ]
];

// Send the response
sendResponse('success', 'Products retrieved successfully', $responseData);

// Debug log function
function debug_log($message, $data = null) {
    $log = date('Y-m-d H:i:s') . " - " . $message;
    if ($data !== null) {
        $log .= " - " . (is_array($data) || is_object($data) ? json_encode($data) : $data);
    }
    error_log($log);
}

// Debug log function - already defined above
// No need to redefine sendResponse function here

// Debug: Check database connection
debug_log("Database connection check", mysqli_ping($db) ? "Connected" : "Not connected");

// Debug: Check products table
$checkTable = mysqli_query($db, "SHOW TABLES LIKE 'products'");
debug_log("Products table exists", mysqli_num_rows($checkTable) > 0 ? "Yes" : "No");

// Debug: Count products
$countQuery = "SELECT COUNT(*) as count FROM products";
$countResult = mysqli_query($db, $countQuery);
$count = mysqli_fetch_assoc($countResult)['count'];
debug_log("Total products in database", $count);

// Debug: Count active products
$activeQuery = "SELECT COUNT(*) as count FROM products WHERE is_active = '1'";
$activeResult = mysqli_query($db, $activeQuery);
$activeCount = mysqli_fetch_assoc($activeResult)['count'];
debug_log("Active products in database", $activeCount);

// Debug: Get a sample product
$sampleQuery = "SELECT * FROM products WHERE is_active = '1' LIMIT 1";
$sampleResult = mysqli_query($db, $sampleQuery);
if ($sampleResult && mysqli_num_rows($sampleResult) > 0) {
    $sample = mysqli_fetch_assoc($sampleResult);
    debug_log("Sample product", $sample);
} else {
    debug_log("No sample product found");
}

// Get pagination parameters
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 12;
$offset = ($page - 1) * $limit;

// Debug: Pagination parameters
debug_log("Pagination parameters", ["page" => $page, "limit" => $limit, "offset" => $offset]);

// Get list of products with pagination and filtering
$baseQuery = "FROM products p
             LEFT JOIN product_categories pc ON p.id = pc.product_id
             LEFT JOIN categories c ON pc.category_id = c.id
             LEFT JOIN product_images pi ON p.id = pi.product_id
             WHERE p.is_active = '1'";

// Debug: Base query
debug_log("Base query", $baseQuery);

// Get total count for pagination
$countQuery = "SELECT COUNT(DISTINCT p.id) as total $baseQuery";
debug_log("Count query", $countQuery);

$countResult = mysqli_query($db, $countQuery);
if (!$countResult) {
    debug_log("Count query error", mysqli_error($db));
    sendResponse(false, null, "Database error: " . mysqli_error($db), 500);
}

$total = (int)mysqli_fetch_assoc($countResult)['total'];
debug_log("Total products from count query", $total);

// Get products with pagination and related data
$query = "SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT CONCAT_WS('|', c.id, c.name_en, c.name_de) SEPARATOR ';;') as category_info,
            GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.is_primary DESC SEPARATOR ';;') as image_paths
          $baseQuery
          GROUP BY p.id
          ORDER BY p.name ASC
          LIMIT $limit OFFSET $offset";

debug_log("Products query", $query);

$result = mysqli_query($db, $query);
if (!$result) {
    debug_log("Products query error", mysqli_error($db));
    sendResponse(false, null, "Database error: " . mysqli_error($db), 500);
}

debug_log("Products query result count", mysqli_num_rows($result));

// Process product rows
$products = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Debug: Raw product row
    debug_log("Processing product row", ["id" => $row['id'], "name" => $row['name']]);
    
    // Process categories
    $categories = [];
    if (!empty($row['category_info'])) {
        $categoryItems = explode(';;', $row['category_info']);
        foreach ($categoryItems as $item) {
            if (!empty($item)) {
                list($cat_id, $name_en, $name_de) = explode('|', $item);
                $categories[] = [
                    'id' => $cat_id,
                    'name_en' => $name_en,
                    'name_de' => $name_de
                ];
            }
        }
    }
    
    // Process images
    $images = [];
    if (!empty($row['image_paths'])) {
        $imagePaths = explode(';;', $row['image_paths']);
        foreach ($imagePaths as $path) {
            if (!empty($path)) {
                $images[] = $path;
            }
        }
    }
    
    // Build product data
    $product = [
        'id' => $row['id'],
        'name' => $row['name'],
        'price' => (float)$row['price'],
        'description_en' => $row['description_en'] ?? $row['description'] ?? '',
        'description_de' => $row['description_de'] ?? '',
        'is_active' => $row['is_active'] === '1',
        'is_featured' => $row['is_featured'] === '1',
        'sku' => $row['sku'] ?? '',
        'stock' => (int)($row['stock'] ?? 0),
        'categories' => $categories,
        'images' => $images,
        'image' => !empty($images[0]) ? $images[0] : null
    ];
    
    $products[] = $product;
    debug_log("Processed product", ["id" => $product['id'], "name" => $product['name']]);
}

debug_log("Total processed products", count($products));

// Calculate pagination info
$totalPages = ceil($total / $limit);
$currentPage = floor($offset / $limit) + 1;

// Prepare response with pagination info
$response = [
    'data' => $products,
    'pagination' => [
        'total' => $total,
        'page' => $currentPage,
        'limit' => $limit,
        'pages' => $totalPages
    ]
];

debug_log("Final response", ["product_count" => count($products), "pagination" => $response['pagination']]);

// Send the response
sendResponse('success', 'Products retrieved successfully', $response);
?>
