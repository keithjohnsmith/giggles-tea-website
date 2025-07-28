<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
require_once __DIR__ . '/server/config/database.php';

// Test different SQL queries
echo "<h1>Testing Product Queries</h1>";

// Test 1: Original query with is_active = 1
$query1 = "SELECT COUNT(*) as count FROM products WHERE is_active = 1";
$result1 = mysqli_query($db, $query1);
$count1 = mysqli_fetch_assoc($result1)['count'];
echo "<p>Query 1 (is_active = 1): Found $count1 products</p>";

// Test 2: Modified query with is_active = '1'
$query2 = "SELECT COUNT(*) as count FROM products WHERE is_active = '1'";
$result2 = mysqli_query($db, $query2);
$count2 = mysqli_fetch_assoc($result2)['count'];
echo "<p>Query 2 (is_active = '1'): Found $count2 products</p>";

// Test 3: Query without is_active filter
$query3 = "SELECT COUNT(*) as count FROM products";
$result3 = mysqli_query($db, $query3);
$count3 = mysqli_fetch_assoc($result3)['count'];
echo "<p>Query 3 (no filter): Found $count3 products</p>";

// Test 4: Check data types in the database
echo "<h2>Data Type Check</h2>";
$query4 = "SELECT id, name, is_active, TYPEOF(is_active) as type_info FROM products LIMIT 5";
$result4 = mysqli_query($db, $query4);
if (!$result4) {
    echo "<p>Error in query 4: " . mysqli_error($db) . "</p>";
    
    // Alternative query for MySQL which doesn't have TYPEOF
    $query4alt = "SELECT id, name, is_active FROM products LIMIT 5";
    $result4alt = mysqli_query($db, $query4alt);
    if ($result4alt) {
        echo "<table border='1'><tr><th>ID</th><th>Name</th><th>is_active</th></tr>";
        while ($row = mysqli_fetch_assoc($result4alt)) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($row['id']) . "</td>";
            echo "<td>" . htmlspecialchars($row['name']) . "</td>";
            echo "<td>" . htmlspecialchars($row['is_active']) . " (type: " . gettype($row['is_active']) . ")</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
} else {
    echo "<table border='1'><tr><th>ID</th><th>Name</th><th>is_active</th><th>Type</th></tr>";
    while ($row = mysqli_fetch_assoc($result4)) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($row['id']) . "</td>";
        echo "<td>" . htmlspecialchars($row['name']) . "</td>";
        echo "<td>" . htmlspecialchars($row['is_active']) . "</td>";
        echo "<td>" . htmlspecialchars($row['type_info']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
}
