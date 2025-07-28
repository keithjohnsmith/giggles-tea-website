<?php
/**
 * Test Products API Endpoint (Fixed Version)
 * 
 * This file is a test version of the products API endpoint.
 * It's designed to be run directly from the command line for testing.
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type for JSON output
header("Content-Type: application/json; charset=UTF-8");

// Include database configuration
require_once __DIR__ . '/../server/config/database.php';

try {
    // Base query parts
    $selectFields = "
        p.id, p.name, p.german_name, p.price, p.description, 
        p.category_en, p.category_de, p.category_id,
        GROUP_CONCAT(DISTINCT CONCAT_WS('|', c.id, c.name_en, c.name_de) SEPARATOR ';;') as category_info,
        GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.is_primary DESC, pi.position ASC SEPARATOR ';;') as image_paths
    ";
    
    $fromClause = "
        products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN product_images pi ON p.id = pi.product_id
    ";
    
    $whereClause = "p.is_active = 1";
    
    // Construct the main query
    $query = "SELECT {$selectFields} FROM {$fromClause} WHERE {$whereClause} GROUP BY p.id ORDER BY p.name ASC LIMIT 10";
    
    // Execute the query
    $result = mysqli_query($db, $query);
    
    if (!$result) {
        throw new Exception("Query failed: " . mysqli_error($db));
    }
    
    // Process results
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
        $primaryImage = null;
        if (!empty($row['image_paths'])) {
            $imagePaths = explode(';;', $row['image_paths']);
            foreach ($imagePaths as $index => $path) {
                if (!empty($path)) {
                    $images[] = $path;
                    if ($index === 0) {
                        $primaryImage = $path;
                    }
                }
            }
        }
        
        // Build product object
        $product = [
            'id' => $row['id'],
            'name' => $row['name'],
            'german_name' => $row['german_name'],
            'price' => $row['price'],
            'description' => $row['description'],
            'category_en' => $row['category_en'],
            'category_de' => $row['category_de'],
            'category_id' => $row['category_id'],
            'categories' => $categories,
            'images' => $images,
            'primary_image' => $primaryImage
        ];
        
        $products[] = $product;
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'products' => $products,
        'count' => count($products)
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'query' => $query ?? 'No query executed',
        'mysql_error' => mysqli_error($db)
    ], JSON_PRETTY_PRINT);
}
?>
