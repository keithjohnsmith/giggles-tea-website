<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Directory to scan for images
$baseDir = $_SERVER['DOCUMENT_ROOT'] . '/giggles-tea/server/Tea Catalogue/';

// Check if directory exists
if (!is_dir($baseDir)) {
    die("Error: Directory not found: " . htmlspecialchars($baseDir));
}

// Get list of subdirectories (product folders)
$productDirs = array_filter(glob($baseDir . '*'), 'is_dir');

// Count total images found
$totalImages = 0;
?>
<!DOCTYPE html>
<html>
<head>
    <title>Image Directory Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .product-dir { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .images { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 10px; }
        .image { border: 1px solid #eee; padding: 10px; border-radius: 5px; }
        .image img { max-width: 100%; height: auto; }
        .path { font-family: monospace; font-size: 12px; color: #666; word-break: break-all; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>Image Directory Test</h1>
    <p>Scanning directory: <?php echo htmlspecialchars($baseDir); ?></p>
    
    <?php if (empty($productDirs)): ?>
        <p class="error">No product directories found!</p>
    <?php else: ?>
        <p>Found <?php echo count($productDirs); ?> product directories.</p>
        
        <?php
        // Show first 5 product directories with their images
        $count = 0;
        foreach ($productDirs as $dir) {
            if ($count >= 5) break; // Limit to first 5 for performance
            
            $dirName = basename($dir);
            $images = glob($dir . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
            $totalImages += count($images);
            ?>
            <div class="product-dir">
                <h2>Product ID: <?php echo htmlspecialchars($dirName); ?></h2>
                <p>Path: <?php echo htmlspecialchars($dir); ?></p>
                <p>Images found: <?php echo count($images); ?></p>
                
                <?php if (!empty($images)): ?>
                    <div class="images">
                        <?php foreach (array_slice($images, 0, 3) as $image): // Show first 3 images ?>
                            <div class="image">
                                <?php
                                $relativePath = str_replace($_SERVER['DOCUMENT_ROOT'], '', $image);
                                $relativePath = str_replace('\\', '/', $relativePath); // Fix Windows paths
                                ?>
                                <img src="<?php echo $relativePath; ?>" 
                                     alt="Product image" 
                                     onerror="this.onerror=null; this.parentNode.innerHTML+='<div class=\'error\'>Error loading image</div>'">
                                <div class="path"><?php echo htmlspecialchars(basename($image)); ?></div>
                                <div class="path"><?php echo htmlspecialchars($relativePath); ?></div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <p class="error">No images found in this directory.</p>
                <?php endif; ?>
            </div>
            <?php
            $count++;
        }
        ?>
        
        <div class="summary">
            <h3>Summary</h3>
            <p>Total product directories: <?php echo count($productDirs); ?></p>
            <p>Total images found: <?php echo $totalImages; ?></p>
        </div>
    <?php endif; ?>
</body>
</html>
