<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once __DIR__ . '/server/config/database.php';

// Set headers
header('Content-Type: text/plain'); // Use plain text for better debug readability

// Function to output debug information
function debugOutput($title, $data) {
    echo "=== $title ===\n";
    if (is_array($data) || is_object($data)) {
        print_r($data);
    } else {
        echo $data . "\n";
    }
    echo "\n";
}

// Check database connection
try {
    debugOutput("Database Connection", "Attempting to connect to database...");
    // Note: $db should already be connected from the included database.php
    
    if (mysqli_connect_errno()) {
        debugOutput("Connection Error", mysqli_connect_error());
        exit(json_encode(['status' => 'error', 'message' => 'Database connection failed']));
    }
    
    debugOutput("Connection Success", "Connected to database successfully");
    
    // Check if products table exists
    $tablesResult = mysqli_query($db, "SHOW TABLES LIKE 'products'");
    if (mysqli_num_rows($tablesResult) == 0) {
        debugOutput("Table Check", "Products table does not exist");
        exit(json_encode(['status' => 'error', 'message' => 'Products table does not exist']));
    }
    
    debugOutput("Table Check", "Products table exists");
    
    // Count products
    $countResult = mysqli_query($db, "SELECT COUNT(*) as total FROM products");
    $countRow = mysqli_fetch_assoc($countResult);
    $totalProducts = $countRow['total'];
    
    debugOutput("Product Count", "Total products: " . $totalProducts);
    
    // Get first 5 products for debugging
    $productsResult = mysqli_query($db, "SELECT * FROM products LIMIT 5");
    $products = [];
    
    if ($productsResult) {
        debugOutput("Query Success", "Successfully queried products table");
        
        // Get column information
        $columnsResult = mysqli_query($db, "SHOW COLUMNS FROM products");
        $columns = [];
        while ($column = mysqli_fetch_assoc($columnsResult)) {
            $columns[] = $column;
        }
        
        debugOutput("Table Structure", $columns);
        
        // Get product data
        while ($row = mysqli_fetch_assoc($productsResult)) {
            $products[] = $row;
        }
        
        debugOutput("Sample Products", $products);
    } else {
        debugOutput("Query Error", mysqli_error($db));
    }
    
    // Check for is_active column and its values
    $isActiveResult = mysqli_query($db, "SELECT id, is_active FROM products LIMIT 10");
    if ($isActiveResult) {
        $isActiveData = [];
        while ($row = mysqli_fetch_assoc($isActiveResult)) {
            $isActiveData[] = $row;
        }
        debugOutput("is_active Values", $isActiveData);
    }
    
    // Output final status
    echo json_encode([
        'status' => 'success',
        'message' => 'Debug information retrieved successfully',
        'data' => [
            'database_connected' => true,
            'products_table_exists' => true,
            'total_products' => $totalProducts,
            'sample_products' => $products
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    debugOutput("Exception", $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred: ' . $e->getMessage()
    ]);
}
?>
