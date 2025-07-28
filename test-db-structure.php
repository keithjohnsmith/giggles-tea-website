<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
$db = mysqli_connect('localhost', 'root', '', 'giggles_tea');

// Check connection
if (!$db) {
    die("Connection failed: " . mysqli_connect_error());
}

// Get table structure
$result = mysqli_query($db, "DESCRIBE products");
if (!$result) {
    die("Error describing table: " . mysqli_error($db));
}

// Get a sample product to see the actual field names with data
$sample = mysqli_query($db, "SELECT * FROM products LIMIT 1");
$sampleData = mysqli_fetch_assoc($sample);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Database Structure Check</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Products Table Structure</h1>
    
    <h2>Columns in 'products' table:</h2>
    <table>
        <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Null</th>
            <th>Key</th>
            <th>Default</th>
            <th>Extra</th>
        </tr>
        <?php while ($row = mysqli_fetch_assoc($result)): ?>
        <tr>
            <td><?php echo htmlspecialchars($row['Field']); ?></td>
            <td><?php echo htmlspecialchars($row['Type']); ?></td>
            <td><?php echo htmlspecialchars($row['Null']); ?></td>
            <td><?php echo htmlspecialchars($row['Key']); ?></td>
            <td><?php echo htmlspecialchars($row['Default'] ?? 'NULL'); ?></td>
            <td><?php echo htmlspecialchars($row['Extra']); ?></td>
        </tr>
        <?php endwhile; ?>
    </table>
    
    <h2>Sample Product Data:</h2>
    <pre><?php print_r($sampleData); ?></pre>
    
    <?php
    // Close database connection
    mysqli_close($db);
    ?>
</body>
</html>
