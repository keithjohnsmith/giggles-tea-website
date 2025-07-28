<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Test database connection
echo "<h2>Testing Database Connection</h2>";

try {
    // Database configuration
    $db_host = 'localhost';
    $db_name = 'giggles_tea';
    $db_user = 'root';
    $db_pass = '';
    
    // Create connection
    $db = mysqli_connect($db_host, $db_user, $db_pass, $db_name);
    
    if (!$db) {
        throw new Exception("Connection failed: " . mysqli_connect_error());
    }
    
    echo "<p style='color: green;'>✅ Database connection successful!</p>";
    
    // Test query
    $query = "SHOW TABLES";
    $result = mysqli_query($db, $query);
    
    if ($result) {
        echo "<h3>Database Tables:</h3>";
        echo "<ul>";
        while ($row = mysqli_fetch_array($result)) {
            echo "<li>" . $row[0] . "</li>";
        }
        echo "</ul>";
    } else {
        echo "<p style='color: orange;'>⚠️ Query failed: " . mysqli_error($db) . "</p>";
    }
    
    // Close connection
    mysqli_close($db);
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}

// Test PHP configuration
echo "<h2>PHP Configuration</h2>";
echo "<pre>";
echo "PHP Version: " . phpversion() . "\n";
echo "MySQLi Extension: " . (extension_loaded('mysqli') ? '✅ Loaded' : '❌ Not Loaded') . "\n";
echo "PDO Extension: " . (extension_loaded('pdo') ? '✅ Loaded' : '❌ Not Loaded') . "\n";
echo "PDO MySQL Extension: " . (extension_loaded('pdo_mysql') ? '✅ Loaded' : '❌ Not Loaded') . "\n";

// Check file permissions
$writable_dirs = [
    '.',
    'api',
    'server/config'
];

echo "\n<h3>Directory Permissions:</h3>";
foreach ($writable_dirs as $dir) {
    $path = __DIR__ . '/' . $dir;
    $isWritable = is_writable($path);
    echo ($isWritable ? '✅' : '❌') . " $dir is " . ($isWritable ? 'writable' : 'not writable') . "<br>\n";}

echo "</pre>";
?>
