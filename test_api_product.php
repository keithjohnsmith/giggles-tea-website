<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Test product ID
$productId = 22789;

echo "<h1>API Product Test</h1>";
echo "<p>Testing API endpoint for product ID: {$productId}</p>";

// Direct API URL
$apiUrl = "/giggles-tea/api/products_fixed?id={$productId}";
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
?>
