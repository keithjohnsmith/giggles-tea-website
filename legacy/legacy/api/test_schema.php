<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
header("Content-Type: application/json; charset=UTF-8");

// Include database configuration
require_once __DIR__ . '/../server/config/database.php';

try {
    // Get table structure
    $tables = ['products', 'product_categories', 'categories', 'product_images'];
    $schema = [];
    
    foreach ($tables as $table) {
        $result = mysqli_query($db, "SHOW COLUMNS FROM $table");
        if ($result) {
            $schema[$table] = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $schema[$table][] = $row;
            }
        } else {
            $schema[$table] = "Error: " . mysqli_error($db);
        }
    }
    
    // Return the schema as JSON
    echo json_encode([
        'success' => true,
        'schema' => $schema
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
