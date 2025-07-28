<?php
// Set CORS headers
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Include database configuration
    require_once __DIR__ . '/../server/config/database.php';
    
    // Test query
    $query = "SELECT 1 as test";
    $result = mysqli_query($db, $query);
    
    if ($result) {
        $data = mysqli_fetch_assoc($result);
        echo json_encode([
            'success' => true,
            'message' => 'Database connection successful',
            'data' => $data
        ]);
    } else {
        throw new Exception('Query failed: ' . mysqli_error($db));
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database test failed',
        'error' => $e->getMessage()
    ]);
}
