<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
require_once __DIR__ . '/server/config/database.php';

// Check if products table has data
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
    
    // Check if the products table structure is correct
    $result = mysqli_query($db, "DESCRIBE products");
    if (!$result) {
        echo "Error describing products table: " . mysqli_error($db);
        exit;
    }
    
    echo "\nProducts table structure:\n";
    while ($row = mysqli_fetch_assoc($result)) {
        echo $row['Field'] . " - " . $row['Type'] . " - " . ($row['Null'] === 'YES' ? 'NULL' : 'NOT NULL') . "\n";
    }
}
?>
