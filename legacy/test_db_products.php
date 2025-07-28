<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Include database configuration
require_once __DIR__ . '/server/config/database.php';

// Function to send JSON response
function sendResponse($success, $data = null, $error = null) {
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ]);
    exit();
}

// Get test type from query parameter
$test = isset($_GET['test']) ? $_GET['test'] : 'connection';

// Test database connection
if ($test === 'connection') {
    if ($db) {
        sendResponse(true, [
            'message' => 'Database connection successful',
            'server_info' => mysqli_get_server_info($db),
            'host_info' => mysqli_get_host_info($db)
        ]);
    } else {
        sendResponse(false, null, 'Database connection failed: ' . mysqli_connect_error());
    }
}

// Check if products table exists
else if ($test === 'check_table') {
    $query = "SHOW TABLES LIKE 'products'";
    $result = mysqli_query($db, $query);
    
    if ($result) {
        if (mysqli_num_rows($result) > 0) {
            // Table exists, get its structure
            $structure_query = "DESCRIBE products";
            $structure_result = mysqli_query($db, $structure_query);
            
            $columns = [];
            while ($row = mysqli_fetch_assoc($structure_result)) {
                $columns[] = $row;
            }
            
            sendResponse(true, [
                'message' => 'Products table exists',
                'columns' => $columns
            ]);
        } else {
            sendResponse(false, null, 'Products table does not exist');
        }
    } else {
        sendResponse(false, null, 'Error checking table: ' . mysqli_error($db));
    }
}

// Count products in the database
else if ($test === 'count_products') {
    $query = "SELECT COUNT(*) as count FROM products";
    $result = mysqli_query($db, $query);
    
    if ($result) {
        $row = mysqli_fetch_assoc($result);
        $count = $row['count'];
        
        // Get a sample of products
        $sample_query = "SELECT id, name, price, category FROM products LIMIT 5";
        $sample_result = mysqli_query($db, $sample_query);
        
        $samples = [];
        if ($sample_result) {
            while ($sample_row = mysqli_fetch_assoc($sample_result)) {
                $samples[] = $sample_row;
            }
        }
        
        sendResponse(true, [
            'message' => 'Products count retrieved',
            'count' => $count,
            'samples' => $samples
        ]);
    } else {
        sendResponse(false, null, 'Error counting products: ' . mysqli_error($db));
    }
}

// Check for specific product
else if ($test === 'get_product') {
    $id = isset($_GET['id']) ? $_GET['id'] : 1;
    
    $query = "SELECT * FROM products WHERE id = ?";
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, 'i', $id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($result) {
        if (mysqli_num_rows($result) > 0) {
            $product = mysqli_fetch_assoc($result);
            sendResponse(true, [
                'message' => 'Product found',
                'product' => $product
            ]);
        } else {
            sendResponse(false, null, "Product with ID $id not found");
        }
    } else {
        sendResponse(false, null, 'Error retrieving product: ' . mysqli_error($db));
    }
}

// List all products (limited)
else if ($test === 'list_products') {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    
    $query = "SELECT * FROM products LIMIT ?";
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, 'i', $limit);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($result) {
        $products = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $products[] = $row;
        }
        
        sendResponse(true, [
            'message' => 'Products retrieved',
            'count' => count($products),
            'products' => $products
        ]);
    } else {
        sendResponse(false, null, 'Error retrieving products: ' . mysqli_error($db));
    }
}

// Unknown test
else {
    sendResponse(false, null, 'Unknown test type');
}
?>
