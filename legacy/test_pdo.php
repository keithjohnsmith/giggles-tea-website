<?php
// Display PHP information for debugging
echo "<h1>PHP Info</h1>";
echo "<h2>Loaded Extensions</h2>";
echo "<pre>";
print_r(get_loaded_extensions());
echo "</pre>";

echo "<h2>PDO Drivers</h2>";
echo "<pre>";
if (class_exists('PDO')) {
    print_r(PDO::getAvailableDrivers());
} else {
    echo "PDO class does not exist!";
}
echo "</pre>";

// Try a simple database connection
echo "<h2>Database Connection Test</h2>";
try {
    $dsn = "mysql:host=localhost;dbname=giggles_tea";
    $user = "root";
    $password = "";
    
    $pdo = new PDO($dsn, $user, $password);
    echo "Database connection successful!";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
