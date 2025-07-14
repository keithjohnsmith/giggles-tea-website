<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simple test output
echo "<h1>PHP Test Page</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";

// Test MySQLi extension
if (extension_loaded('mysqli')) {
    echo "<p style='color: green;'>✅ MySQLi extension is loaded</p>";
    
    // Test database connection
    $db = @mysqli_connect('localhost', 'root', '', 'giggles_tea');
    
    if ($db) {
        echo "<p style='color: green;'>✅ Connected to database successfully</p>";
        
        // Test query
        $result = mysqli_query($db, "SHOW TABLES");
        if ($result) {
            echo "<h3>Database Tables:</h3>";
            echo "<ul>";
            while ($row = mysqli_fetch_array($result)) {
                echo "<li>" . $row[0] . "</li>";
            }
            echo "</ul>";
        } else {
            echo "<p style='color: orange;'>⚠️ Could not list tables: " . mysqli_error($db) . "</p>";
        }
        
        mysqli_close($db);
    } else {
        echo "<p style='color: red;'>❌ Could not connect to database: " . mysqli_connect_error() . "</p>";
    }
} else {
    echo "<p style='color: red;'>❌ MySQLi extension is NOT loaded</p>";
}

// List loaded extensions
echo "<h3>Loaded Extensions:</h3>";
echo "<ul>";
$extensions = get_loaded_extensions();
sort($extensions);
foreach ($extensions as $ext) {
    echo "<li>$ext</li>";
}
echo "</ul>";
?>
