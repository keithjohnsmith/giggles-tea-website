<?php
header('Content-Type: application/json');
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication

// Database configuration
$host = 'localhost';
$dbname = 'giggles_tea';
$username = 'root';
$password = '';

$response = [
    'success' => false,
    'tables' => [],
    'error' => null
];

try {
    // Create connection
    $conn = new mysqli($host, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Get list of tables
    $result = $conn->query("SHOW TABLES");
    
    if ($result === false) {
        throw new Exception("Error fetching tables: " . $conn->error);
    }
    
    $tables = [];
    while ($row = $result->fetch_array()) {
        $tableName = $row[0];
        $tables[] = $tableName;
        
        // Get table structure
        $tableResult = $conn->query("DESCRIBE `$tableName`");
        if ($tableResult) {
            $response['tables'][$tableName] = [];
            while ($column = $tableResult->fetch_assoc()) {
                $response['tables'][$tableName][] = $column;
            }
        }
    }
    
    $response['success'] = true;
    
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);

// Close connection
if (isset($conn)) {
    $conn->close();
}
?>
