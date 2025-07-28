<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Base directory where images are stored
$baseDir = __DIR__ . '/Tea Catalogue/';

// Get the requested image path from the URL
$requestedImage = isset($_GET['img']) ? trim($_GET['img']) : '';

// Validate the requested image path
if (empty($requestedImage)) {
    http_response_code(400);
    die('No image specified');
}

// Prevent directory traversal
if (strpos($requestedImage, '..') !== false) {
    http_response_code(403);
    die('Access denied');
}

// Find the image in the subdirectories
$imagePath = null;
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($baseDir, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);

foreach ($iterator as $file) {
    if ($file->isFile() && strtolower($file->getFilename()) === strtolower($requestedImage)) {
        $imagePath = $file->getPathname();
        break;
    }
}

// If image not found, return 404
if (!$imagePath || !file_exists($imagePath)) {
    http_response_code(404);
    die('Image not found');
}

// Get the MIME type
$mime = mime_content_type($imagePath);
if (!$mime) {
    $mime = 'application/octet-stream';
}

// Set headers and output the image
header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($imagePath));
header('Cache-Control: public, max-age=31536000');
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');

// Output the file
readfile($imagePath);
?>
