<?php
// Simple script to test API response structure
header("Content-Type: application/json; charset=UTF-8");

// Create a sample response that matches our expected structure
$response = [
    'status' => 'success',
    'message' => 'Products retrieved successfully',
    'data' => [
        'data' => [
            [
                'id' => '1',
                'name' => 'Test Product',
                'price' => 19.99,
                'description_en' => 'Test description',
                'description_de' => 'Test Beschreibung',
                'is_active' => true,
                'is_featured' => false,
                'sku' => 'TEST-001',
                'stock' => 10,
                'categories' => [],
                'images' => ['test.jpg'],
                'image' => 'test.jpg'
            ]
        ],
        'pagination' => [
            'total' => 1,
            'page' => 1,
            'limit' => 12,
            'pages' => 1
        ]
    ]
];

echo json_encode($response);
?>
