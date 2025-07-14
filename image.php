<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get the image path from the URL
$imagePath = $_GET['path'] ?? '';

// Validate the image path
if (empty($imagePath)) {
    http_response_code(400);
    die('No image path specified');
}

// Decode URL-encoded characters
$imagePath = urldecode($imagePath);

// The base directory where images are stored (using forward slashes for consistency)
$baseDir = str_replace('\\', '/', __DIR__ . '/server/');

// For debugging
$debug = false;
if ($debug) {
    error_log("Image path: {$imagePath}");
    error_log("Base dir: {$baseDir}");
}

// Clean up the requested path
$imagePath = ltrim($imagePath, '/');
$imagePath = str_replace('..', '', $imagePath); // Prevent directory traversal

// The expected path format is: {productId}/{filename}
$pathParts = explode('/', $imagePath);
$pathParts = array_filter($pathParts); // Remove empty parts

// Rebuild the path with proper structure
$relativePath = implode('/', $pathParts);

// Construct the full path to the image file
$fullPath = $baseDir . $relativePath;

// Normalize path separators
$fullPath = str_replace('\\', '/', $fullPath);
$baseDir = str_replace('\\', '/', realpath($baseDir)) . '/';

// Get the real path to check for path traversal
$realPath = realpath($fullPath);

// If the file doesn't exist, try to find it with a different extension
if ($realPath === false) {
    $supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $pathInfo = pathinfo($fullPath);
    
    // If the path doesn't have an extension, try adding common ones
    if (empty($pathInfo['extension'])) {
        foreach ($supportedExtensions as $ext) {
            $testPath = $fullPath . '.' . $ext;
            if (file_exists($testPath) && is_readable($testPath)) {
                $realPath = realpath($testPath);
                $fullPath = $testPath;
                break;
            }
        }
    }
}

// Debugging information
$debugInfo = [
    'requested_path' => $imagePath,
    'base_dir' => $baseDir,
    'full_path' => $fullPath,
    'real_path' => $realPath,
    'path_exists' => $realPath !== false,
    'is_readable' => $realPath !== false && is_readable($realPath)
];

// Security check: ensure the file is within the allowed directory
if ($realPath === false || strpos(str_replace('\\', '/', $realPath), $baseDir) !== 0) {
    // For debugging, you can uncomment the next line to see the paths being checked
    // die(json_encode($debugInfo, JSON_PRETTY_PRINT));
    
    header('Content-Type: application/json');
    http_response_code(403);
    die(json_encode([
        'error' => 'Access denied - Invalid path',
        'debug' => $debugInfo
    ], JSON_PRETTY_PRINT));
}

// Check if file exists and is readable
if (!file_exists($realPath) || !is_readable($realPath)) {
    header('Content-Type: application/json');
    http_response_code(404);
    die(json_encode([
        'error' => 'Image not found',
        'debug' => $debugInfo
    ], JSON_PRETTY_PRINT));
}

// Get the MIME type of the image
$mimeTypes = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'webp' => 'image/webp',
];

$extension = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
$mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

// Set the appropriate headers
header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($realPath));
header('Cache-Control: public, max-age=31536000');
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');

// Output the image file
readfile($realPath);
