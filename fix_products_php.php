<?php
// This script will fix the products.php file by removing references to the non-existent sort_order column

$file = __DIR__ . '/api/products.php';
$content = file_get_contents($file);

if ($content === false) {
    echo "Error: Could not read file $file";
    exit(1);
}

// Replace the problematic SQL parts
$pattern = '/ORDER BY pi\.is_primary DESC, pi\.sort_order ASC/';
$replacement = 'ORDER BY pi.is_primary DESC';
$newContent = preg_replace($pattern, $replacement, $content);

if ($newContent === null) {
    echo "Error: preg_replace failed";
    exit(1);
}

// Write the fixed content back to the file
if (file_put_contents($file, $newContent) === false) {
    echo "Error: Could not write to file $file";
    exit(1);
}

echo "Successfully fixed products.php";
?>