<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'giggles_tea';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected successfully to database: " . $db_name . "<br><br>";

// Test query
$sql = "SELECT COUNT(*) as product_count FROM products";
$result = $conn->query($sql);

if ($result) {
    $row = $result->fetch_assoc();
    echo "Total products in database: " . $row['product_count'] . "<br>";
} else {
    echo "Error executing query: " . $conn->error . "<br>";
}

// Close connection
$conn->close();
?>
