<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once __DIR__ . '/server/config/database.php';

// Set headers
header('Content-Type: text/plain'); // Use plain text for better debug readability

echo "=== Deep API Debug ===\n\n";

// Check if products table has active products
echo "1. Checking active products:\n";
$activeQuery = "SELECT COUNT(*) as active_count FROM products WHERE status = 'active' AND is_active = '1'";
$activeResult = mysqli_query($db, $activeQuery);
$activeCount = mysqli_fetch_assoc($activeResult)['active_count'];
echo "Products with status 'active' AND is_active = '1': $activeCount\n\n";

// Check product_images table
echo "2. Checking product_images table:\n";
$imagesQuery = "SHOW TABLES LIKE 'product_images'";
$imagesResult = mysqli_query($db, $imagesQuery);
if (mysqli_num_rows($imagesResult) > 0) {
    echo "product_images table exists\n";
    
    // Check structure
    $structureQuery = "DESCRIBE product_images";
    $structureResult = mysqli_query($db, $structureQuery);
    echo "Structure:\n";
    while ($row = mysqli_fetch_assoc($structureResult)) {
        echo "- {$row['Field']} ({$row['Type']})\n";
    }
    
    // Check content
    $contentQuery = "SELECT COUNT(*) as count FROM product_images";
    $contentResult = mysqli_query($db, $contentQuery);
    $imageCount = mysqli_fetch_assoc($contentResult)['count'];
    echo "Total images: $imageCount\n";
} else {
    echo "product_images table does not exist!\n";
}
echo "\n";

// Test the exact query from products.php
echo "3. Testing exact query from products.php:\n";
$testQuery = "SELECT 
                p.*,
                GROUP_CONCAT(DISTINCT CONCAT_WS('|', c.id, c.name_en, c.name_de) SEPARATOR ';;') as category_info,
                GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.is_primary DESC SEPARATOR ';;') as image_paths
              FROM products p
              LEFT JOIN product_categories pc ON p.id = pc.product_id
              LEFT JOIN categories c ON pc.category_id = c.id
              LEFT JOIN product_images pi ON p.id = pi.product_id
              WHERE p.is_active = '1'
              GROUP BY p.id
              ORDER BY p.name ASC
              LIMIT 10";

$testResult = mysqli_query($db, $testQuery);

if ($testResult) {
    echo "Query successful! Found " . mysqli_num_rows($testResult) . " products\n";
    $i = 0;
    while ($row = mysqli_fetch_assoc($testResult)) {
        $i++;
        echo "Product $i:\n";
        echo "- ID: {$row['id']}, Name: {$row['name']}, Status: {$row['status']}\n";
        echo "- is_active: {$row['is_active']}, price: {$row['price']}\n";
        echo "- category_info: " . (empty($row['category_info']) ? "EMPTY" : $row['category_info']) . "\n";
        echo "- image_paths: " . (empty($row['image_paths']) ? "EMPTY" : $row['image_paths']) . "\n\n";
    }
} else {
    echo "Query failed: " . mysqli_error($db) . "\n";
}

// Check if the processProductRow function works correctly
echo "4. Testing processProductRow function:\n";

// Define a simplified version of processProductRow function
function processProductRow($row) {
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
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'price' => (float)$row['price'],
        'description_en' => $row['description_en'] ?? $row['description'] ?? '',
        'description_de' => $row['description_de'] ?? '',
        'is_active' => $row['is_active'] === '1',
        'is_featured' => $row['is_featured'] === '1',
        'sku' => $row['sku'] ?? '',
        'stock' => (int)($row['stock'] ?? 0),
        'categories' => $categories,
        'images' => $images,
        'image' => !empty($images[0]) ? $images[0] : null
    ];
}

// Get a few products and process them
$simpleQuery = "SELECT * FROM products WHERE is_active = '1' LIMIT 3";
$simpleResult = mysqli_query($db, $simpleQuery);

echo "Simple products query:\n";
if ($simpleResult && mysqli_num_rows($simpleResult) > 0) {
    while ($row = mysqli_fetch_assoc($simpleResult)) {
        $processed = processProductRow($row);
        echo "- ID: {$processed['id']}, Name: {$processed['name']}, Price: {$processed['price']}\n";
        echo "  Is Active: " . ($processed['is_active'] ? 'true' : 'false') . "\n";
        echo "  Categories: " . count($processed['categories']) . "\n";
        echo "  Images: " . count($processed['images']) . "\n";
        echo "  Primary Image: " . ($processed['image'] ?? 'NONE') . "\n\n";
    }
} else {
    echo "No products found or query failed\n";
}

// Test the API endpoint directly
echo "5. Testing API endpoint directly:\n";
$apiUrl = "http://localhost/giggles-tea/api/products";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);

echo "API Response Status: {$info['http_code']}\n";
echo "Response Length: " . strlen($response) . " bytes\n";
echo "Response Preview: " . substr($response, 0, 200) . "...\n\n";

// Parse the JSON response
$responseData = json_decode($response, true);
if (json_last_error() === JSON_ERROR_NONE) {
    echo "JSON parsed successfully\n";
    echo "Success: " . ($responseData['success'] ? 'true' : 'false') . "\n";
    
    if (isset($responseData['data']) && isset($responseData['data']['data'])) {
        echo "Products count: " . count($responseData['data']['data']) . "\n";
        
        if (count($responseData['data']['data']) > 0) {
            $firstProduct = $responseData['data']['data'][0];
            echo "First product: " . json_encode($firstProduct, JSON_PRETTY_PRINT) . "\n";
        } else {
            echo "No products in response\n";
        }
    } else {
        echo "No data array in response\n";
    }
} else {
    echo "JSON parse error: " . json_last_error_msg() . "\n";
}

echo "\n=== End of Debug ===\n";
?>
