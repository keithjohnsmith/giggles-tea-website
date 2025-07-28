<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once __DIR__ . '/server/config/database.php';

// Set headers
header('Content-Type: text/plain'); // Use plain text for better debug readability

echo "=== API Query Debug ===\n\n";

// Check product_images table structure
echo "Product Images Table Structure:\n";
$tableQuery = "DESCRIBE product_images";
$tableResult = mysqli_query($db, $tableQuery);

if ($tableResult) {
    while ($row = mysqli_fetch_assoc($tableResult)) {
        echo "- {$row['Field']} ({$row['Type']})\n";
    }
} else {
    echo "Error checking table structure: " . mysqli_error($db) . "\n";
}

echo "\n=== Testing Modified Query ===\n\n";

// Test a modified query without the sort_order column
$testQuery = "SELECT 
                p.*,
                GROUP_CONCAT(DISTINCT CONCAT_WS('|', c.id, c.name_en, c.name_de) SEPARATOR ';;') as category_info,
                GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.is_primary DESC SEPARATOR ';;') as image_paths
              FROM products p
              LEFT JOIN product_categories pc ON p.id = pc.product_id
              LEFT JOIN categories c ON pc.category_id = c.id
              LEFT JOIN product_images pi ON p.id = pi.product_id
              WHERE p.is_active = '1'
              GROUP BY p.id
              ORDER BY p.name ASC
              LIMIT 5";

$testResult = mysqli_query($db, $testQuery);

echo "Modified query test:\n";
if ($testResult) {
    echo "Query successful! Found " . mysqli_num_rows($testResult) . " products\n";
    while ($row = mysqli_fetch_assoc($testResult)) {
        echo "- ID: {$row['id']}, Name: {$row['name']}, Status: {$row['status']}\n";
    }
} else {
    echo "Query failed: " . mysqli_error($db) . "\n";
}

echo "\n=== Creating Fix Script ===\n\n";

// Generate a fix script for products.php
$fixScript = "<?php
// This script will fix the products.php file by removing references to the non-existent sort_order column

\$file = __DIR__ . '/api/products.php';
\$content = file_get_contents(\$file);

if (\$content === false) {
    echo \"Error: Could not read file \$file\";
    exit(1);
}

// Replace the problematic SQL parts
\$pattern = '/ORDER BY pi\\.is_primary DESC, pi\\.sort_order ASC/';
\$replacement = 'ORDER BY pi.is_primary DESC';
\$newContent = preg_replace(\$pattern, \$replacement, \$content);

if (\$newContent === null) {
    echo \"Error: preg_replace failed\";
    exit(1);
}

// Write the fixed content back to the file
if (file_put_contents(\$file, \$newContent) === false) {
    echo \"Error: Could not write to file \$file\";
    exit(1);
}

echo \"Successfully fixed products.php\";
?>";

echo "Fix script generated. Run this script to automatically fix the products.php file.\n";
file_put_contents(__DIR__ . '/fix_products_php.php', $fixScript);

echo "\n=== End of Debug ===\n";
?>
