<?php
// Script to check if database tables exist

// Set error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "=== GIGGLES TEA DATABASE STRUCTURE CHECK ===\n\n";

try {
    // Connect to database using MySQLi
    echo "Connecting to database...\n";
    $mysqli = new mysqli('localhost', 'root', '', 'giggles_tea');
    
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "Connection successful!\n\n";
    
    // List all tables in the database
    echo "Tables in database:\n";
    echo "-------------------\n";
    $tables = $mysqli->query("SHOW TABLES");
    
    if ($tables && $tables->num_rows > 0) {
        while ($table = $tables->fetch_array()) {
            echo "- " . $table[0] . "\n";
            
            // Show table structure
            echo "  Structure:\n";
            $columns = $mysqli->query("DESCRIBE " . $table[0]);
            if ($columns && $columns->num_rows > 0) {
                while ($column = $columns->fetch_assoc()) {
                    echo "    " . $column['Field'] . " (" . $column['Type'] . ")\n";
                }
            }
            echo "\n";
        }
    } else {
        echo "No tables found in the database.\n";
    }
    
    // Close connection
    $mysqli->close();
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
