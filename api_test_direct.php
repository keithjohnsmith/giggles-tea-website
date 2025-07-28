<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once __DIR__ . '/server/config/database.php';

// Set headers
header('Content-Type: text/plain'); // Use plain text for better debug readability

echo "=== API Test ===\n\n";

// Direct database query to get products
$query = "SELECT * FROM products WHERE status = 'active' LIMIT 5";
$result = mysqli_query($db, $query);

echo "Direct query for active products:\n";
if ($result && mysqli_num_rows($result) > 0) {
    echo "Found " . mysqli_num_rows($result) . " active products\n";
    while ($row = mysqli_fetch_assoc($result)) {
        echo "- ID: {$row['id']}, Name: {$row['name']}, Status: {$row['status']}\n";
    }
} else {
    echo "No active products found. Error: " . mysqli_error($db) . "\n";
}

echo "\n=== API Simulation ===\n\n";

// Simulate the API query
$baseQuery = "FROM products p
             LEFT JOIN product_categories pc ON p.id = pc.product_id
             LEFT JOIN categories c ON pc.category_id = c.id
             LEFT JOIN product_images pi ON p.id = pi.product_id
             WHERE 1=1";

// Get total count for pagination
$countQuery = "SELECT COUNT(DISTINCT p.id) as total $baseQuery";
$countStmt = mysqli_prepare($db, $countQuery);
mysqli_stmt_execute($countStmt);
$countResult = mysqli_stmt_get_result($countStmt);
$total = (int)mysqli_fetch_assoc($countResult)['total'];

echo "Total products from API query: $total\n\n";

// Get products with pagination and related data
$query = "SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT CONCAT_WS('|', c.id, c.name_en, c.name_de) SEPARATOR ';;') as category_info,
            GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.is_primary DESC, pi.sort_order ASC SEPARATOR ';;') as image_paths
          $baseQuery
          GROUP BY p.id
          ORDER BY p.name ASC
          LIMIT 5";

$result = mysqli_query($db, $query);

echo "API query results:\n";
if ($result && mysqli_num_rows($result) > 0) {
    echo "Found " . mysqli_num_rows($result) . " products\n";
    while ($row = mysqli_fetch_assoc($result)) {
        echo "- ID: {$row['id']}, Name: {$row['name']}, Status: {$row['status']}\n";
    }
} else {
    echo "No products found. Error: " . mysqli_error($db) . "\n";
}

// Check if there's any hidden filtering in the processProductRow function
echo "\n=== Process Product Row Test ===\n\n";

// Define a simplified version of processProductRow function
function processProductRow($row) {
    // Build product data
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'price' => (float)$row['price'],
        'status' => $row['status'],
        'is_active' => $row['is_active'] === '1',
        'is_featured' => $row['is_featured'] === '1'
    ];
}

// Get a few products and process them
$query = "SELECT * FROM products LIMIT 5";
$result = mysqli_query($db, $query);

echo "Processed products:\n";
if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $processed = processProductRow($row);
        echo "- ID: {$processed['id']}, Name: {$processed['name']}, Status: {$row['status']}, Is Active: " . ($processed['is_active'] ? 'true' : 'false') . "\n";
    }
} else {
    echo "No products found\n";
}

echo "\n=== End of Test ===\n";
?>
