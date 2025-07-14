<?php
// Database configuration
$db_host = 'localhost';
$db_name = 'giggles_tea';
$db_user = 'root';
$db_pass = '';

// Create connection
$db = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

// Check connection
if (!$db) {
    error_log("Database Connection Error: " . mysqli_connect_error());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => mysqli_connect_error()
    ]);
    exit();
}

// Set charset to utf8mb4
mysqli_set_charset($db, "utf8mb4");
