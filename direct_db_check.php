<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
require_once __DIR__ . '/server/config/database.php';

// Function to output results in a readable format
function outputResult($title, $data) {
    echo "<h3>$title</h3>";
    echo "<pre>";
    print_r($data);
    echo "</pre>";
    echo "<hr>";
}

// Check database connection
echo "<h2>Database Connection</h2>";
if (mysqli_ping($db)) {
    echo "<p style='color:green'>Connected to database successfully!</p>";
} else {
    echo "<p style='color:red'>Database connection failed: " . mysqli_error($db) . "</p>";
    exit;
}

// Check products table
echo "<h2>Products Table Check</h2>";
$checkTable = mysqli_query($db, "SHOW TABLES LIKE 'products'");
if (mysqli_num_rows($checkTable) > 0) {
    echo "<p style='color:green'>Products table exists!</p>";
} else {
    echo "<p style='color:red'>Products table does not exist!</p>";
    exit;
}

// Count products
$countQuery = "SELECT COUNT(*) as count FROM products";
$countResult = mysqli_query($db, $countQuery);
$count = mysqli_fetch_assoc($countResult)['count'];
echo "<p>Total products in database: <strong>$count</strong></p>";

// Count active products
$activeQuery = "SELECT COUNT(*) as count FROM products WHERE is_active = '1'";
$activeResult = mysqli_query($db, $activeQuery);
$activeCount = mysqli_fetch_assoc($activeResult)['count'];
echo "<p>Active products in database: <strong>$activeCount</strong></p>";

// Check product statuses
$statusQuery = "SELECT status, COUNT(*) as count FROM products GROUP BY status";
$statusResult = mysqli_query($db, $statusQuery);
echo "<h3>Product Status Counts:</h3>";
echo "<ul>";
while ($row = mysqli_fetch_assoc($statusResult)) {
    echo "<li>Status '{$row['status']}': {$row['count']} products</li>";
}
echo "</ul>";

// Get a sample of products
$sampleQuery = "SELECT * FROM products LIMIT 5";
$sampleResult = mysqli_query($db, $sampleQuery);
$samples = [];
while ($row = mysqli_fetch_assoc($sampleResult)) {
    $samples[] = $row;
}
outputResult("Sample Products (First 5)", $samples);

// Try the exact query from products.php
echo "<h2>Testing products.php Query</h2>";

// Base query from products.php
$baseQuery = "FROM products p
             LEFT JOIN product_categories pc ON p.id = pc.product_id
             LEFT JOIN categories c ON pc.category_id = c.id
             LEFT JOIN product_images pi ON p.id = pi.product_id
             WHERE p.is_active = '1'";

// Count query
$countQuery = "SELECT COUNT(DISTINCT p.id) as total $baseQuery";
echo "<p>Count query: <code>$countQuery</code></p>";

$countResult = mysqli_query($db, $countQuery);
if (!$countResult) {
    echo "<p style='color:red'>Count query error: " . mysqli_error($db) . "</p>";
} else {
    $total = (int)mysqli_fetch_assoc($countResult)['total'];
    echo "<p>Total products from count query: <strong>$total</strong></p>";
}

// Main products query
$query = "SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT CONCAT_WS('|', c.id, c.name_en, c.name_de) SEPARATOR ';;') as category_info,
            GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.is_primary DESC SEPARATOR ';;') as image_paths
          $baseQuery
          GROUP BY p.id
          ORDER BY p.name ASC
          LIMIT 10";

echo "<p>Products query: <code>$query</code></p>";

$result = mysqli_query($db, $query);
if (!$result) {
    echo "<p style='color:red'>Products query error: " . mysqli_error($db) . "</p>";
} else {
    echo "<p>Products query result count: <strong>" . mysqli_num_rows($result) . "</strong></p>";
    
    // Process product rows
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
        
        $products[] = $product;
    }
    
    outputResult("Processed Products (First 10)", $products);
}

// Check if there's a status filter in the original query
echo "<h2>Checking for Status Filter</h2>";
$checkStatusQuery = "SELECT * FROM products WHERE status = 'active' LIMIT 1";
$checkStatusResult = mysqli_query($db, $checkStatusQuery);
if (!$checkStatusResult) {
    echo "<p style='color:red'>Status query error: " . mysqli_error($db) . "</p>";
} else {
    echo "<p>Products with status 'active': <strong>" . mysqli_num_rows($checkStatusResult) . "</strong></p>";
}

// Try a query without the status filter
echo "<h2>Testing Query Without Status Filter</h2>";
$noStatusQuery = "SELECT * FROM products WHERE is_active = '1' LIMIT 10";
$noStatusResult = mysqli_query($db, $noStatusQuery);
if (!$noStatusResult) {
    echo "<p style='color:red'>Query error: " . mysqli_error($db) . "</p>";
} else {
    $noStatusProducts = [];
    while ($row = mysqli_fetch_assoc($noStatusResult)) {
        $noStatusProducts[] = $row;
    }
    echo "<p>Products found without status filter: <strong>" . count($noStatusProducts) . "</strong></p>";
    outputResult("Products Without Status Filter (First 10)", $noStatusProducts);
}
?>
