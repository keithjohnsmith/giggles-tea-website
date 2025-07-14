<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
header("Content-Type: application/json; charset=UTF-8");
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication

// Include database configuration
require_once __DIR__ . '/../server/config/database.php';

try {
    // Query to get all active products with their categories and images
    $query = "SELECT 
                p.id, p.name, p.german_name, p.price, p.description, 
                p.category, p.category_en, p.category_id,
                GROUP_CONCAT(DISTINCT CONCAT_WS('|', c.id, c.name_en, c.name_de) SEPARATOR ';;') as category_info,
                GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.is_primary DESC, pi.sort_order ASC SEPARATOR ';;') as image_paths
              FROM products p
              LEFT JOIN product_categories pc ON p.id = pc.product_id
              LEFT JOIN categories c ON pc.category_id = c.id
              LEFT JOIN product_images pi ON p.id = pi.product_id
              WHERE p.is_active = 1
              GROUP BY p.id
              ORDER BY p.name ASC
              LIMIT 10";
    
    $result = mysqli_query($db, $query);
    
    if (!$result) {
        throw new Exception("Query failed: " . mysqli_error($db));
    }
    
    $products = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Process categories
        $categories = [];
        if (!empty($row['category_info'])) {
            $categoryItems = explode(';;', $row['category_info']);
            foreach ($categoryItems as $item) {
                if (!empty($item)) {
                    list($cat_id, $name_en, $name_de) = explode('|', $item);
                    $categories[] = [
                        'id' => $cat_id,
                        'name_en' => $name_en,
                        'name_de' => $name_de
                    ];
                }
            }
        }
        
        // Process images
        $images = [];
        if (!empty($row['image_paths'])) {
            $imagePaths = explode(';;', $row['image_paths']);
            foreach ($imagePaths as $path) {
                if (!empty($path)) {
                    $images[] = $path;
                }
            }
        }
        
        // Build product data
        $product = [
            'id' => $row['id'],
            'name' => $row['name'],
            'german_name' => $row['german_name'],
            'price' => (float)$row['price'],
            'description' => $row['description'],
            'category' => $row['category'],
            'category_en' => $row['category_en'],
            'category_id' => $row['category_id'],
            'categories' => $categories,
            'images' => $images,
            'image' => !empty($images[0]) ? $images[0] : null
        ];
        
        $products[] = $product;
    }
    
    // Return the products as JSON
    echo json_encode([
        'success' => true,
        'data' => $products,
        'count' => count($products)
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'query' => $query ?? null,
        'mysql_error' => $db ? mysqli_error($db) : null
    ], JSON_PRETTY_PRINT);
}
?>
