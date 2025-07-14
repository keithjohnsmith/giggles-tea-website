<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Test image path
$testImagePath = "Tea Catalogue/22789/22789.jpg";

echo "<h1>Image Test</h1>";
echo "<p>Testing image path: {$testImagePath}</p>";

// The base directory where images are stored (using forward slashes for consistency)
$baseDir = str_replace('\\', '/', __DIR__ . '/server/');
$fullPath = $baseDir . $testImagePath;

echo "<p>Base directory: {$baseDir}</p>";
echo "<p>Full path: {$fullPath}</p>";
echo "<p>File exists: " . (file_exists($fullPath) ? "Yes" : "No") . "</p>";

// Display the image if it exists
if (file_exists($fullPath)) {
    echo "<h2>Image Preview:</h2>";
    echo "<img src='/giggles-tea/server/{$testImagePath}' alt='Test Image' style='max-width: 300px;'>";
} else {
    echo "<p style='color: red;'>Image file not found!</p>";
    
    // Check if the directory exists
    $dir = dirname($fullPath);
    echo "<p>Directory exists: " . (is_dir($dir) ? "Yes" : "No") . "</p>";
    
    // List files in the directory if it exists
    if (is_dir($dir)) {
        echo "<h3>Files in directory:</h3>";
        echo "<ul>";
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file != "." && $file != "..") {
                echo "<li>{$file}</li>";
            }
        }
        echo "</ul>";
    }
}
?>
