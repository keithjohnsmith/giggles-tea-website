<?php
// Enable error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include database connection
include 'server/config/database.php';

// Check if database connection is successful
if (!$db) {
    echo "Database connection failed: " . mysqli_connect_error();
    exit;
}

echo "<h1>Database Connection Test</h1>";
echo "<p>Database connection successful!</p>";

// Check for featured products
$featuredQuery = "SELECT COUNT(*) as count FROM products WHERE is_featured = '1'";
$featuredResult = mysqli_query($db, $featuredQuery);
$featuredRow = mysqli_fetch_assoc($featuredResult);
echo "<p>Featured products count: " . $featuredRow['count'] . "</p>";

// Check for active products
$activeQuery = "SELECT COUNT(*) as count FROM products WHERE is_active = '1'";
$activeResult = mysqli_query($db, $activeQuery);
$activeRow = mysqli_fetch_assoc($activeResult);
echo "<p>Active products count: " . $activeRow['count'] . "</p>";

// Check for all products
$allQuery = "SELECT COUNT(*) as count FROM products";
$allResult = mysqli_query($db, $allQuery);
$allRow = mysqli_fetch_assoc($allResult);
echo "<p>Total products count: " . $allRow['count'] . "</p>";

// Check the structure of the products table
echo "<h2>Products Table Structure</h2>";
$structureQuery = "DESCRIBE products";
$structureResult = mysqli_query($db, $structureQuery);

echo "<table border='1'>";
echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
while ($row = mysqli_fetch_assoc($structureResult)) {
    echo "<tr>";
    echo "<td>" . $row['Field'] . "</td>";
    echo "<td>" . $row['Type'] . "</td>";
    echo "<td>" . $row['Null'] . "</td>";
    echo "<td>" . $row['Key'] . "</td>";
    echo "<td>" . $row['Default'] . "</td>";
    echo "<td>" . $row['Extra'] . "</td>";
    echo "</tr>";
}
echo "</table>";

// List a few products to check their structure
echo "<h2>Sample Products</h2>";
$sampleQuery = "SELECT id, name, is_active, is_featured FROM products LIMIT 5";
$sampleResult = mysqli_query($db, $sampleQuery);

echo "<table border='1'>";
echo "<tr><th>ID</th><th>Name</th><th>is_active</th><th>is_featured</th></tr>";
while ($row = mysqli_fetch_assoc($sampleResult)) {
    echo "<tr>";
    echo "<td>" . $row['id'] . "</td>";
    echo "<td>" . $row['name'] . "</td>";
    echo "<td>" . $row['is_active'] . "</td>";
    echo "<td>" . $row['is_featured'] . "</td>";
    echo "</tr>";
}
echo "</table>";
?>
