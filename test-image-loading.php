<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
$db = mysqli_connect('localhost', 'root', '', 'giggles_tea');

// Check connection
if (!$db) {
    die("Connection failed: " . mysqli_connect_error());
}

// Debug: Check if table exists
$tableCheck = mysqli_query($db, "SHOW TABLES LIKE 'products'");
if (mysqli_num_rows($tableCheck) == 0) {
    die("Error: 'products' table does not exist in the database.");
}

// Get sample products with their images
$query = "SELECT id, name, images FROM products WHERE images IS NOT NULL AND images != '' LIMIT 5";
$result = mysqli_query($db, $query);

if (!$result) {
    die("Query failed: " . mysqli_error($db));
}

// Debug: Check how many rows we got
$productCount = mysqli_num_rows($result);

// Start HTML output
?>
<!DOCTYPE html>
<html>
<head>
    <title>Image Loading Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .product { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .image-container { margin: 10px 0; }
        .image-container img { max-width: 300px; max-height: 300px; }
        .file-info { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 3px; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Image Loading Test</h1>
    <p>Testing direct image access from the server.</p>
    
    <div class="debug-info" style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <h2>Debug Information:</h2>
        <p><strong>Products found:</strong> <?php echo $productCount; ?></p>
        <p><strong>Database:</strong> <?php echo 'giggles_tea'; ?></p>
        <p><strong>Query:</strong> <?php echo htmlspecialchars($query); ?></p>
        
        <?php if ($productCount > 0): ?>
            <h3>Sample of first product's data:</h3>
            <pre><?php 
                $firstProduct = $products[0] ?? null;
                if ($firstProduct) {
                    print_r($firstProduct);
                }
            ?></pre>
        <?php else: ?>
            <p class="error">No products found with image data. Trying to find any products...</p>
            <?php 
            // Try to get any products to see what's in the database
            $allProductsQuery = "SELECT id, name, images FROM products LIMIT 5";
            $allProductsResult = mysqli_query($db, $allProductsQuery);
            if ($allProductsResult && mysqli_num_rows($allProductsResult) > 0) {
                echo "<h4>First few products in database:</h4>";
                echo "<ul>";
                while ($row = mysqli_fetch_assoc($allProductsResult)) {
                    echo "<li>ID: {$row['id']} - " . htmlspecialchars($row['name']) . "";
                    if (!empty($row['images'])) {
                        echo " (has images data)";
                    } else {
                        echo " <span class='error'>(no images data)</span>";
                    }
                    echo "</li>";
                }
                echo "</ul>";
            } else {
                echo "<p class='error'>No products found in the database at all.</p>";
            }
            ?>
        <?php endif; ?>
    </div>
    
    <?php while ($product = mysqli_fetch_assoc($result)): ?>
        <div class="product">
            <h2><?php echo htmlspecialchars($product['name']); ?> (ID: <?php echo $product['id']; ?>)</h2>
            <div class="file-info">
 <p><strong>Images JSON:</strong> <?php echo htmlspecialchars($product['images']); ?></p>
                <p><strong>First image path:</strong> <?php echo htmlspecialchars($image_path); ?></p>
                
                <?php
                $images = json_decode($product['images'], true);
                $image_path = is_array($images) && !empty($images[0]) ? $images[0] : '';
                
                if (empty($image_path)) {
                    echo "<p class='error'>No image path found in the images JSON</p>";
                    continue;
                }
                
                // Clean up the path
                $image_path = str_replace('\\', '/', $image_path);
                $absolute_path = $_SERVER['DOCUMENT_ROOT'] . '/giggles-tea/server/Tea Catalogue/' . ltrim($image_path, '/');
                $url_path = '/giggles-tea/server/Tea%20Catalogue/' . urlencode(ltrim($image_path, '/'));
                
                // Check if file exists
                $file_exists = file_exists($absolute_path);
                ?>
                
                <p><strong>File exists:</strong> 
                    <?php if ($file_exists): ?>
                        <span class="success">Yes</span>
                    <?php else: ?>
                        <span class="error">No</span>
                    <?php endif; ?>
                </p>
                
                <?php if ($file_exists): ?>
                    <p><strong>File size:</strong> <?php echo round(filesize($absolute_path) / 1024, 2); ?> KB</p>
                    <p><strong>File permissions:</strong> <?php echo substr(sprintf('%o', fileperms($absolute_path)), -4); ?></p>
                    
                    <div class="image-container">
                        <h3>Testing image display:</h3>
                        <img src="<?php echo $url_path; ?>" 
                             alt="<?php echo htmlspecialchars($product['name']); ?>"
                             onerror="this.onerror=null; this.parentNode.innerHTML+='<div class=\'error\'>Error loading image: ' + this.src + '</div>';">
                        <p><a href="<?php echo $url_path; ?>" target="_blank">Open image in new tab</a></p>
                    </div>
                <?php else: ?>
                    <p class="error">File not found at: <?php echo htmlspecialchars($absolute_path); ?></p>
                    
                    <h3>Searching in subdirectories...</h3>
                    <?php
                    $base_dir = $_SERVER['DOCUMENT_ROOT'] . '/giggles-tea/server/Tea Catalogue/';
                    $found = false;
                    
                    if (is_dir($base_dir)) {
                        $iterator = new RecursiveIteratorIterator(
                            new RecursiveDirectoryIterator($base_dir, RecursiveDirectoryIterator::SKIP_DOTS),
                            RecursiveIteratorIterator::SELF_FIRST
                        );
                        
                        $filename = basename($image_path);
                        
                        foreach ($iterator as $file) {
                            if ($file->isFile() && strtolower($file->getFilename()) === strtolower($filename)) {
                                $found_path = str_replace('\\', '/', $file->getPathname());
                                $relative_path = str_replace($_SERVER['DOCUMENT_ROOT'], '', $found_path);
                                $found = true;
                                ?>
                                <div class="success">
                                    <p>Found file at: <?php echo htmlspecialchars($found_path); ?></p>
                                    <p>Relative URL: <a href="<?php echo $relative_path; ?>" target="_blank"><?php echo $relative_path; ?></a></p>
                                    <img src="<?php echo $relative_path; ?>" 
                                         alt="Found: <?php echo htmlspecialchars($filename); ?>"
                                         style="max-width: 300px; max-height: 300px;">
                                </div>
                                <?php
                                break;
                            }
                        }
                        
                        if (!$found) {
                            echo '<p class="error">File not found in any subdirectories.</p>';
                        }
                    } else {
                        echo '<p class="error">Base directory not found: ' . htmlspecialchars($base_dir) . '</p>';
                    }
                    ?>
                <?php endif; ?>
            </div>
        </div>
    <?php endwhile; ?>
    
    <?php
    // Close database connection
    mysqli_close($db);
    ?>
</body>
</html>
