<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to JSON
header('Content-Type: application/json');

// Response array
$response = [
    'success' => false,
    'error' => null,
    'server_info' => null,
    'database' => null,
    'tables' => []
];

try {
    // Database configuration
    $db_host = 'localhost';
    $db_name = 'giggles_tea';
    $db_user = 'root';
    $db_pass = '';

    // Create connection
    $db = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

    // Check connection
    if (!$db) {
        throw new Exception("Connection failed: " . mysqli_connect_error());
    }

    // Set charset to utf8mb4
    mysqli_set_charset($db, "utf8mb4");

    // Get server info
    $response['server_info'] = mysqli_get_server_info($db);
    $response['database'] = $db_name;
    
    // Get list of tables
    $tables_result = mysqli_query($db, "SHOW TABLES");
    if ($tables_result) {
        while ($row = mysqli_fetch_array($tables_result)) {
            $response['tables'][] = $row[0];
        }
    }
    
    // Set success flag
    $response['success'] = true;
    
    // Close connection
    mysqli_close($db);
    
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

// Output JSON response
echo json_encode($response, JSON_PRETTY_PRINT);
