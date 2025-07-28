<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
require_once __DIR__ . '/server/config/database.php';

// Check if database connection is working
if (!$db) {
    echo "Database connection failed: " . mysqli_connect_error();
    exit;
}

echo "Database connection successful!\n";

// Check if products table exists
$result = mysqli_query($db, "SHOW TABLES LIKE 'products'");
if (mysqli_num_rows($result) == 0) {
    echo "Products table does not exist!\n";
    exit;
}

echo "Products table exists.\n";

// Count products
$result = mysqli_query($db, "SELECT COUNT(*) as count FROM products");
if (!$result) {
    echo "Error counting products: " . mysqli_error($db);
    exit;
}

$row = mysqli_fetch_assoc($result);
echo "Number of products in database: " . $row['count'] . "\n";

// If there are products, show the first 5
if ($row['count'] > 0) {
    $result = mysqli_query($db, "SELECT id, name, price FROM products LIMIT 5");
    if (!$result) {
        echo "Error fetching products: " . mysqli_error($db);
        exit;
    }
    
    echo "\nFirst 5 products:\n";
    while ($row = mysqli_fetch_assoc($result)) {
        echo "ID: " . $row['id'] . ", Name: " . $row['name'] . ", Price: " . $row['price'] . "\n";
    }
} else {
    echo "No products found in the database. This explains why the API returns empty arrays.\n";
}

// Check database schema
echo "\nDatabase schema:\n";
$result = mysqli_query($db, "SHOW TABLES");
if (!$result) {
    echo "Error showing tables: " . mysqli_error($db);
    exit;
}

echo "Tables in database:\n";
while ($row = mysqli_fetch_row($result)) {
    echo "- " . $row[0] . "\n";
}
?>
