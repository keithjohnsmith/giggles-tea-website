<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simple database connection
$db_host = 'localhost';
$db_name = 'giggles_tea';
$db_user = 'root';
$db_pass = '';

// Create connection
$db = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

// Check connection
if (!$db) {
    echo "Database connection failed: " . mysqli_connect_error();
    exit;
}

echo "Database connection successful!<br>";

// Check if products table exists
$result = mysqli_query($db, "SHOW TABLES LIKE 'products'");
if (mysqli_num_rows($result) == 0) {
    echo "Products table does not exist!<br>";
    exit;
}

echo "Products table exists.<br>";

// Count products
$result = mysqli_query($db, "SELECT COUNT(*) as count FROM products");
if (!$result) {
    echo "Error counting products: " . mysqli_error($db) . "<br>";
    exit;
}

$row = mysqli_fetch_assoc($result);
echo "Number of products in database: " . $row['count'] . "<br>";

// If there are products, show the first 5
if ($row['count'] > 0) {
    $result = mysqli_query($db, "SELECT id, name, price FROM products LIMIT 5");
    if (!$result) {
        echo "Error fetching products: " . mysqli_error($db) . "<br>";
        exit;
    }
    
    echo "<br>First 5 products:<br>";
    while ($row = mysqli_fetch_assoc($result)) {
        echo "ID: " . $row['id'] . ", Name: " . $row['name'] . ", Price: " . $row['price'] . "<br>";
    }
} else {
    echo "No products found in the database. This explains why the API returns empty arrays.<br>";
    
    // Check if the products table structure is correct
    $result = mysqli_query($db, "DESCRIBE products");
    if (!$result) {
        echo "Error describing products table: " . mysqli_error($db) . "<br>";
        exit;
    }
    
    echo "<br>Products table structure:<br>";
    while ($row = mysqli_fetch_assoc($result)) {
        echo $row['Field'] . " - " . $row['Type'] . " - " . ($row['Null'] === 'YES' ? 'NULL' : 'NOT NULL') . "<br>";
    }
}
?>
