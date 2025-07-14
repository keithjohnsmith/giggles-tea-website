<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Test product ID
$productId = 22789;

echo "<h1>Standalone API Product Test</h1>";
echo "<p>Testing standalone API endpoint for product ID: {$productId}</p>";

// Direct API URL
$apiUrl = "/giggles-tea/products_standalone.php?id={$productId}";
echo "<p>API URL: {$apiUrl}</p>";

// Make a cURL request to the API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost{$apiUrl}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "<p>HTTP Response Code: {$httpCode}</p>";

// Display the response
echo "<h2>API Response:</h2>";
echo "<pre>";
if ($response) {
    $data = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo json_encode($data, JSON_PRETTY_PRINT);
    } else {
        echo "Error parsing JSON: " . json_last_error_msg();
        echo "\n\nRaw response:\n" . htmlspecialchars($response);
    }
} else {
    echo "No response received";
}
echo "</pre>";

// If we got a successful response with product data, display the images
if ($httpCode == 200 && $response) {
    $data = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE && isset($data['success']) && $data['success'] && !empty($data['products'])) {
        $product = $data['products'][0];
        
        echo "<h2>Product Details:</h2>";
        echo "<p><strong>Name:</strong> " . htmlspecialchars($product['name']) . "</p>";
        echo "<p><strong>ID:</strong> " . htmlspecialchars($product['id']) . "</p>";
        echo "<p><strong>Price:</strong> €" . number_format((float)$product['price'], 2) . "</p>";
        
        if (!empty($product['images'])) {
            echo "<h2>Product Images:</h2>";
            echo "<div style='display: flex; flex-wrap: wrap; gap: 10px;'>";
            foreach ($product['images'] as $imagePath) {
                echo "<div style='margin: 5px; border: 1px solid #ddd; padding: 5px;'>";
                echo "<img src='/giggles-tea/image?path=" . urlencode($imagePath) . "' style='max-width: 200px; max-height: 200px;' alt='Product Image'>";
                echo "<p>" . htmlspecialchars($imagePath) . "</p>";
                echo "</div>";
            }
            echo "</div>";
        } else {
            echo "<p>No images available for this product.</p>";
        }
    }
}
?>
