<?php
// Enable error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include database connection
include 'server/config/database.php';

// Check if database connection is successful
if (!$db) {
    echo "Database connection failed: " . mysqli_connect_error();
    exit;
}

echo "<h1>Direct Products API Test</h1>";

// Function to process product rows
function processProductRow($row) {
    $product = [
        'id' => $row['id'],
        'name' => $row['name'],
        'description_en' => $row['description_en'],
        'description_de' => $row['description_de'],
        'price' => (float)$row['price'],
        'sale_price' => !empty($row['sale_price']) ? (float)$row['sale_price'] : null,
        'stock' => (int)$row['stock'],
        'is_active' => $row['is_active'] === '1',
        'is_featured' => $row['is_featured'] === '1',
        'sku' => $row['sku'],
        'weight' => !empty($row['weight']) ? (float)$row['weight'] : null,
        'dimensions' => $row['dimensions'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at']
    ];
    
    // Process category information if available
    if (!empty($row['category_info'])) {
        $categories = [];
        $categoryInfos = explode(';;', $row['category_info']);
        foreach ($categoryInfos as $info) {
            if (!empty($info)) {
                list($id, $name_en, $name_de) = explode('|', $info);
                $categories[] = [
                    'id' => $id,
                    'name_en' => $name_en,
                    'name_de' => $name_de
                ];
            }
        }
        $product['categories'] = $categories;
    }
    
    // Process image paths if available
    if (!empty($row['image_paths'])) {
        $images = [];
        $imagePaths = explode(';;', $row['image_paths']);
        foreach ($imagePaths as $path) {
            if (!empty($path)) {
                $images[] = $path;
            }
        }
        $product['images'] = $images;
    }
    
    return $product;
}

// Test 1: Get all products
echo "<h2>Test 1: All Products</h2>";
$query = "SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT CONCAT_WS('|', c.id, c.name_en, c.name_de) SEPARATOR ';;') as category_info,
            GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.is_primary DESC, pi.sort_order ASC SEPARATOR ';;') as image_paths
          FROM products p
          LEFT JOIN product_categories pc ON p.id = pc.product_id
          LEFT JOIN categories c ON pc.category_id = c.id
          LEFT JOIN product_images pi ON p.id = pi.product_id
          GROUP BY p.id
          ORDER BY p.name ASC
          LIMIT 10";

$result = mysqli_query($db, $query);

if (!$result) {
    echo "<p>Error: " . mysqli_error($db) . "</p>";
} else {
    $products = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $products[] = processProductRow($row);
    }
    
    echo "<p>Found " . count($products) . " products</p>";
    
    if (count($products) > 0) {
        echo "<pre>" . json_encode($products[0], JSON_PRETTY_PRINT) . "</pre>";
    }
}

// Test 2: Get active products
echo "<h2>Test 2: Active Products</h2>";
$query = "SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT CONCAT_WS('|', c.id, c.name_en, c.name_de) SEPARATOR ';;') as category_info,
            GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.is_primary DESC, pi.sort_order ASC SEPARATOR ';;') as image_paths
          FROM products p
          LEFT JOIN product_categories pc ON p.id = pc.product_id
          LEFT JOIN categories c ON pc.category_id = c.id
          LEFT JOIN product_images pi ON p.id = pi.product_id
          WHERE p.is_active = '1'
          GROUP BY p.id
          ORDER BY p.name ASC
          LIMIT 10";

$result = mysqli_query($db, $query);

if (!$result) {
    echo "<p>Error: " . mysqli_error($db) . "</p>";
} else {
    $products = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $products[] = processProductRow($row);
    }
    
    echo "<p>Found " . count($products) . " active products</p>";
    
    if (count($products) > 0) {
        echo "<pre>" . json_encode($products[0], JSON_PRETTY_PRINT) . "</pre>";
    }
}

// Test 3: Get featured products
echo "<h2>Test 3: Featured Products</h2>";
$query = "SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT CONCAT_WS('|', c.id, c.name_en, c.name_de) SEPARATOR ';;') as category_info,
            GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.is_primary DESC, pi.sort_order ASC SEPARATOR ';;') as image_paths
          FROM products p
          LEFT JOIN product_categories pc ON p.id = pc.product_id
          LEFT JOIN categories c ON pc.category_id = c.id
          LEFT JOIN product_images pi ON p.id = pi.product_id
          WHERE p.is_featured = '1'
          GROUP BY p.id
          ORDER BY p.name ASC
          LIMIT 10";

$result = mysqli_query($db, $query);

if (!$result) {
    echo "<p>Error: " . mysqli_error($db) . "</p>";
} else {
    $products = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $products[] = processProductRow($row);
    }
    
    echo "<p>Found " . count($products) . " featured products</p>";
    
    if (count($products) > 0) {
        echo "<pre>" . json_encode($products[0], JSON_PRETTY_PRINT) . "</pre>";
    }
}

// Test 4: Check if is_featured column exists
echo "<h2>Test 4: Check if is_featured column exists</h2>";
$query = "SHOW COLUMNS FROM products LIKE 'is_featured'";
$result = mysqli_query($db, $query);

if (!$result) {
    echo "<p>Error: " . mysqli_error($db) . "</p>";
} else {
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        echo "<p>is_featured column exists with type: " . $row['Type'] . "</p>";
    } else {
        echo "<p>is_featured column does not exist in the products table!</p>";
    }
}

// Test 5: Check for products with is_featured = '1'
echo "<h2>Test 5: Products with is_featured = '1'</h2>";
$query = "SELECT id, name, is_featured FROM products WHERE is_featured = '1'";
$result = mysqli_query($db, $query);

if (!$result) {
    echo "<p>Error: " . mysqli_error($db) . "</p>";
} else {
    echo "<p>Found " . mysqli_num_rows($result) . " products with is_featured = '1'</p>";
    
    if (mysqli_num_rows($result) > 0) {
        echo "<table border='1'>";
        echo "<tr><th>ID</th><th>Name</th><th>is_featured</th></tr>";
        while ($row = mysqli_fetch_assoc($result)) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['name'] . "</td>";
            echo "<td>" . $row['is_featured'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
}

// Test 6: Update a product to be featured
echo "<h2>Test 6: Update a product to be featured</h2>";
$query = "UPDATE products SET is_featured = '1' WHERE id = 1";
$result = mysqli_query($db, $query);

if (!$result) {
    echo "<p>Error: " . mysqli_error($db) . "</p>";
} else {
    echo "<p>Updated product with ID 1 to be featured</p>";
    
    // Verify the update
    $query = "SELECT id, name, is_featured FROM products WHERE id = 1";
    $result = mysqli_query($db, $query);
    
    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        echo "<p>Product ID 1 now has is_featured = " . $row['is_featured'] . "</p>";
    }
}

// Test 7: Check if the API endpoint is working
echo "<h2>Test 7: API Endpoint Test</h2>";
echo "<p>To test the API endpoint, open: <a href='http://localhost/giggles-tea/api/products?featured=true' target='_blank'>http://localhost/giggles-tea/api/products?featured=true</a></p>";
?>
