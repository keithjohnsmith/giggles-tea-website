<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';

// Set content type to JSON
header('Content-Type: application/json');

// Test get all products
echo "Testing GET /api/products...\n";
$products = [];
$query = "SELECT 
            p.id, p.name, p.german_name, 
            p.category, p.category_en, p.price,
            (SELECT image_path FROM product_images 
             WHERE product_id = p.id AND is_primary = 1 
             LIMIT 1) as image_url
          FROM products p 
          WHERE p.is_active = 1
          ORDER BY p.name ASC";

$result = mysqli_query($db, $query);

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $products[] = $row;
    }
    echo "Successfully retrieved " . count($products) . " active products\n";
    
    // Test get single product if we have any products
    if (!empty($products)) {
        $firstProduct = $products[0];
        echo "\nTesting GET /api/products/" . $firstProduct['id'] . "...\n";
        
        $productId = $firstProduct['id'];
        $query = "SELECT 
                    p.id, p.name, p.german_name, 
                    p.category, p.category_en, p.category_id,
                    p.price, p.description, p.is_active
                  FROM products p 
                  WHERE p.id = ?";
        
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, 's', $productId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) > 0) {
            $product = mysqli_fetch_assoc($result);
            echo "Successfully retrieved product: " . $product['name'] . "\n";
            
            // Test product images
            $query = "SELECT id, image_path as url, is_primary, sort_order 
                      FROM product_images 
                      WHERE product_id = ?";
            
            $stmt = mysqli_prepare($db, $query);
            mysqli_stmt_bind_param($stmt, 's', $productId);
            mysqli_stmt_execute($stmt);
            $imagesResult = mysqli_stmt_get_result($stmt);
            
            $images = [];
            while ($image = mysqli_fetch_assoc($imagesResult)) {
                $images[] = $image;
            }
            
            echo "Found " . count($images) . " images for product\n";
            
            // Test categories
            $query = "SELECT c.id, c.name_en, c.name_de 
                      FROM categories c
                      JOIN product_categories pc ON c.id = pc.category_id
                      WHERE pc.product_id = ?";
            
            $stmt = mysqli_prepare($db, $query);
            mysqli_stmt_bind_param($stmt, 's', $productId);
            mysqli_stmt_execute($stmt);
            $categoriesResult = mysqli_stmt_get_result($stmt);
            
            $categories = [];
            while ($category = mysqli_fetch_assoc($categoriesResult)) {
                $categories[] = $category;
            }
            
            echo "Found " . count($categories) . " categories for product\n";
            
        } else {
            echo "Failed to retrieve product details\n";
        }
    }
} else {
    echo "Error: " . mysqli_error($db) . "\n";
}

// Close connection
mysqli_close($db);
?>
