<?php
/**
 * Simple MySQLi Connection Test
 */

// Set error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "PHP Version: " . phpversion() . "\n";
echo "Checking if MySQLi extension is loaded: " . (extension_loaded('mysqli') ? 'Yes' : 'No') . "\n";

// Database connection parameters
$host = 'localhost';
$dbname = 'giggles_tea';
$username = 'root';
$password = ''; // Default XAMPP password is empty

try {
    echo "Attempting to connect to MySQL database...\n";
    
    // Create connection
    $mysqli = new mysqli($host, $username, $password, $dbname);
    
    // Check connection
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "Connection successful!\n";
    
    // Test a simple query
    $result = $mysqli->query("SHOW TABLES");
    
    if ($result) {
        echo "Tables in database:\n";
        while ($row = $result->fetch_array()) {
            echo "- " . $row[0] . "\n";
        }
        $result->close();
    } else {
        echo "Error executing query: " . $mysqli->error . "\n";
    }
    
    // Close connection
    $mysqli->close();
    echo "Connection closed.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
