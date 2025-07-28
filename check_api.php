<?php
// Simple script to check API response
$url = 'http://localhost/giggles-tea/api/products';
$response = file_get_contents($url);
header('Content-Type: text/plain');
echo $response;
?>
