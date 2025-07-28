<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Include database configuration
require_once __DIR__ . '/server/config/database.php';

// Simple function to get all products directly
function getAllProductsSimple($db) {
    // Very simple query to get all products
    $query = "SELECT * FROM products";
    
    $result = mysqli_query($db, $query);
    
    if (!$result) {
        return [
            'success' => false,
            'error' => mysqli_error($db),
            'query' => $query
        ];
    }
    
    $products = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $products[] = $row;
    }
    
    return [
        'success' => true,
        'count' => count($products),
        'products' => $products
    ];
}

// Get the database connection status
$dbStatus = [
    'connected' => ($db !== false),
    'error' => mysqli_connect_error()
];

// Get all products with a simple query
$productsResult = getAllProductsSimple($db);

// Return the results
echo json_encode([
    'database' => $dbStatus,
    'products' => $productsResult
], JSON_PRETTY_PRINT);
?>
