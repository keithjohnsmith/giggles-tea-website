<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing database connection...<br>";

// Check if MySQLi extension is loaded
echo "MySQLi extension loaded: " . (extension_loaded('mysqli') ? 'Yes' : 'No') . "<br>";

// Include database configuration
require_once __DIR__ . '/server/config/database.php';

// Check if database connection is successful
if (isset($db) && $db) {
    echo "Database connection successful!<br>";
    
    // Test a simple query
    $result = mysqli_query($db, "SHOW TABLES");
    if ($result) {
        echo "Query executed successfully. Tables in database:<br>";
        while ($row = mysqli_fetch_row($result)) {
            echo "- " . $row[0] . "<br>";
        }
    } else {
        echo "Query failed: " . mysqli_error($db) . "<br>";
    }
} else {
    echo "Database connection failed.<br>";
}
?>
