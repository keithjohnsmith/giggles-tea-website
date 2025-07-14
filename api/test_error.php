<?php
// Enable full error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Test database connection
try {
    echo "<h2>Testing database connection...</h2>";
    require_once __DIR__ . '/../server/config/database.php';
    
    if ($db) {
        echo "<p style='color: green;'>✓ Database connection successful!</p>";
        
        // Test a simple query
        $result = mysqli_query($db, "SELECT COUNT(*) as count FROM products");
        if ($result) {
            $row = mysqli_fetch_assoc($result);
            echo "<p>✓ Found " . $row['count'] . " products in the database.</p>";
        } else {
            echo "<p style='color: red;'>✗ Query failed: " . mysqli_error($db) . "</p>";
        }
    } else {
        echo "<p style='color: red;'>✗ Database connection failed.</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Exception: " . $e->getMessage() . "</p>";
}

// Test file permissions
$testFile = __DIR__ . '/test_write.txt';
$testWrite = @file_put_contents($testFile, 'test');
if ($testWrite !== false) {
    echo "<p style='color: green;'>✓ Write permissions are working.</p>";
    unlink($testFile);
} else {
    echo "<p style='color: red;'>✗ Cannot write to directory. Check permissions for: " . __DIR__ . "</p>";
}
?>
