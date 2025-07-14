<?php
/**
 * Giggles Tea - Image Path Update Script
 * 
 * This script scans the server/Tea Catalogue directory and updates the product_images table
 * with the correct paths for each product.
 */

// Database connection parameters
$host = 'localhost';
$dbname = 'giggles_tea';
$username = 'root';
$password = ''; // Default XAMPP password is empty

// Connect to database
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected to database successfully.\n";
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Path to the Tea Catalogue directory
$teaCatalogueDir = __DIR__ . '/server/Tea Catalogue';

if (!is_dir($teaCatalogueDir)) {
    die("Error: Tea Catalogue directory not found at $teaCatalogueDir");
}

// Get all product IDs from the database
try {
    $stmt = $pdo->query("SELECT id, sku FROM products");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($products) . " products in the database.\n";
} catch (PDOException $e) {
    die("Error fetching products: " . $e->getMessage());
}

// Create a mapping of product IDs/SKUs to directory names
$productMapping = [];
foreach ($products as $product) {
    $productMapping[$product['id']] = $product;
}

// Scan the Tea Catalogue directory
$directories = scandir($teaCatalogueDir);
$imageCount = 0;
$updatedProducts = 0;

foreach ($directories as $dir) {
    // Skip . and .. directories
    if ($dir === '.' || $dir === '..') {
        continue;
    }
    
    $fullPath = $teaCatalogueDir . '/' . $dir;
    
    if (is_dir($fullPath)) {
        echo "Processing directory: $dir\n";
        
        // Try to match directory name with product ID or SKU
        $matchedProductId = null;
        
        // Direct match with product ID
        if (isset($productMapping[$dir])) {
            $matchedProductId = $dir;
        } else {
            // Try to find by SKU
            foreach ($productMapping as $productId => $product) {
                if ($product['sku'] === $dir) {
                    $matchedProductId = $productId;
                    break;
                }
            }
        }
        
        if ($matchedProductId) {
            echo "  Matched with product ID: $matchedProductId\n";
            
            // Get all images in this directory
            $images = array_filter(scandir($fullPath), function($file) {
                return !in_array($file, ['.', '..']) && !is_dir($file) && 
                       preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $file);
            });
            
            if (count($images) > 0) {
                // First, delete any existing image records for this product
                try {
                    $deleteStmt = $pdo->prepare("DELETE FROM product_images WHERE product_id = ?");
                    $deleteStmt->execute([$matchedProductId]);
                } catch (PDOException $e) {
                    echo "  Error deleting existing images: " . $e->getMessage() . "\n";
                    continue;
                }
                
                // Insert new image records
                $position = 0;
                foreach ($images as $image) {
                    $imagePath = "server/Tea Catalogue/$dir/$image";
                    $isPrimary = ($position === 0) ? 1 : 0; // First image is primary
                    
                    try {
                        $insertStmt = $pdo->prepare(
                            "INSERT INTO product_images 
                             (product_id, image_path, alt_text, is_primary, position, created_at, updated_at) 
                             VALUES (?, ?, ?, ?, ?, NOW(), NOW())"
                        );
                        $insertStmt->execute([
                            $matchedProductId,
                            $imagePath,
                            "Product image for " . $productMapping[$matchedProductId]['sku'],
                            $isPrimary,
                            $position
                        ]);
                        $imageCount++;
                        $position++;
                    } catch (PDOException $e) {
                        echo "  Error inserting image: " . $e->getMessage() . "\n";
                    }
                }
                
                // Update the main product record with the primary image path
                if (count($images) > 0) {
                    $primaryImagePath = "server/Tea Catalogue/$dir/" . $images[0];
                    $imagesJson = json_encode(array_map(function($img) use ($dir) {
                        return "server/Tea Catalogue/$dir/$img";
                    }, $images));
                    
                    try {
                        $updateStmt = $pdo->prepare(
                            "UPDATE products 
                             SET images = ? 
                             WHERE id = ?"
                        );
                        $updateStmt->execute([$imagesJson, $matchedProductId]);
                        $updatedProducts++;
                    } catch (PDOException $e) {
                        echo "  Error updating product: " . $e->getMessage() . "\n";
                    }
                }
                
                echo "  Added " . count($images) . " images for product ID $matchedProductId\n";
            } else {
                echo "  No images found in directory.\n";
            }
        } else {
            echo "  No matching product found for directory: $dir\n";
        }
    }
}

echo "\nSummary:\n";
echo "Total images processed: $imageCount\n";
echo "Total products updated: $updatedProducts\n";
echo "Done.\n";
