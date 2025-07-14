<?php
// Disable error output in the response
ini_set('display_errors', 0);
error_reporting(0);

// Force PHP to send headers immediately
ob_start();

// Set CORS headers for direct API access - allow any origin for development
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
// Note: When using wildcard (*) for origin, credentials cannot be included
// For production, use specific origins and enable credentials

// Ensure headers are sent even if script execution is interrupted
ob_flush();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type for non-OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
    header("Content-Type: application/json; charset=UTF-8");
}

// Get request method and URI from the router or set defaults
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$requestUri = $_SERVER['REQUEST_URI'] ?? '/api/products';

/**
 * Generate the correct URL for a product image
 * 
 * @param string $imagePath The relative image path from the database
 * @param string $productId The ID of the product (optional)
 * @return string The full URL to the image
 */
function getProductImageUrl($imagePath, $productId = null) {
    // Remove any leading slashes or backslashes
    $imagePath = ltrim($imagePath, '/\\');
    
    // Get the base URL (http://localhost:8000 or your domain in production)
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    
    // Ensure we're using port 8000 for the PHP server in development
    $port = ':8000';
    if (strpos($host, 'localhost') === 0 && strpos($host, ':') === false) {
        $host .= $port;
    }
    
    $baseUrl = "$protocol://$host";
    
    // Encode the path components properly
    $pathParts = explode('/', $imagePath);
    $encodedParts = array_map('rawurlencode', $pathParts);
    $encodedPath = implode('/', $encodedParts);
    
    // If productId is provided, include it in the path
    $productPath = $productId ? "$productId/" : '';
    
    // Construct the full URL to the image in the server/Tea Catalogue directory
    return rtrim($baseUrl, '/') . '/server/Tea%20Catalogue/' . $productPath . $encodedPath;
}

// Extract the ID if present
$matches = [];
preg_match('/\/api\/products\/([^\/]+)/', $requestUri, $matches);
$productId = $matches[1] ?? null;

// Function to get a single product by ID with all related data
function getProductById($db, $productId) {
    // Get product details
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
    
    if (mysqli_num_rows($result) === 0) {
        return null;
    }
    
    $product = mysqli_fetch_assoc($result);
    
    // Get product images with absolute URLs
    $query = "SELECT id, image_path, is_primary, sort_order 
              FROM product_images 
              WHERE product_id = ? 
              ORDER BY is_primary DESC, sort_order ASC";
    
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, 's', $productId);
    mysqli_stmt_execute($stmt);
    $imagesResult = mysqli_stmt_get_result($stmt);
    
    $images = [];
    while ($image = mysqli_fetch_assoc($imagesResult)) {
        // Convert relative path to full URL using our helper function with product ID
        $image['url'] = getProductImageUrl($image['image_path'], $productId);
        $images[] = $image;
    }
    
    $product['images'] = $images;
    
    // Get categories
    $query = "SELECT c.id, c.name_en, c.name_de 
              FROM categories c
              JOIN product_categories pc ON c.id = pc.category_id
              WHERE pc.product_id = ?
              ORDER BY pc.is_primary DESC, pc.sort_order ASC";
    
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, 's', $productId);
    mysqli_stmt_execute($stmt);
    $categoriesResult = mysqli_stmt_get_result($stmt);
    
    $categories = [];
    while ($category = mysqli_fetch_assoc($categoriesResult)) {
        $categories[] = $category;
    }
    
    $product['categories'] = $categories;
    
    return $product;
}

/**
 * Get products with optional filtering
 * @param mysqli $db Database connection
 * @param array $filters Optional filters (e.g., ['isActive' => true])
 * @return array Array of products with their images
 */
function getAllProducts($db, $filters = []) {
    // Build the WHERE clause based on filters
    $whereClause = '1=1';
    $params = [];
    $types = '';
    
    // Apply isActive filter if provided
    if (isset($filters['isActive'])) {
        $whereClause .= ' AND p.is_active = ?';
        $params[] = $filters['isActive'] ? 1 : 0;
        $types .= 'i';
    }
    
    // First, get all products with their primary image
    $query = "SELECT 
                p.id, p.name, p.german_name, p.is_active,
                p.category, p.category_en, p.price, p.category_id,
                (SELECT image_path FROM product_images 
                 WHERE product_id = p.id AND is_primary = 1 
                 LIMIT 1) as image_path
              FROM products p 
              WHERE $whereClause
              ORDER BY p.name ASC";
    
    // Prepare and execute the query with parameters if needed
    $stmt = mysqli_prepare($db, $query);
    
    // Check if statement preparation was successful
    if ($stmt === false) {
        // Log the error for debugging
        error_log("SQL Prepare Error: " . mysqli_error($db) . " in query: $query");
        return [];
    }
    
    // Bind parameters if we have any
    if (!empty($params)) {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }
    
    // Execute the statement and check for errors
    if (!mysqli_stmt_execute($stmt)) {
        error_log("SQL Execute Error: " . mysqli_stmt_error($stmt));
        mysqli_stmt_close($stmt);
        return [];
    }
    
    $result = mysqli_stmt_get_result($stmt);
    
    $products = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Get all images for this product
        $imagesQuery = "SELECT image_path, is_primary, sort_order 
                       FROM product_images 
                       WHERE product_id = ? 
                       ORDER BY is_primary DESC, sort_order ASC";
        
        $stmt = mysqli_prepare($db, $imagesQuery);
        mysqli_stmt_bind_param($stmt, 's', $row['id']);
        mysqli_stmt_execute($stmt);
        $imagesResult = mysqli_stmt_get_result($stmt);
        
        $images = [];
        $primaryImage = null;
        
        while ($image = mysqli_fetch_assoc($imagesResult)) {
            $imageUrl = getProductImageUrl($image['image_path'], $row['id']);
            $imageData = [
                'url' => $imageUrl,
                'is_primary' => (bool)$image['is_primary'],
                'sort_order' => (int)$image['sort_order']
            ];
            
            $images[] = $imageData;
            
            // Set the primary image URL if this is the primary image
            if ($image['is_primary']) {
                $primaryImage = $imageUrl;
            }
        }
        
        // Set the image_url to the primary image or the first image if no primary is set
        $row['image_url'] = $primaryImage ?? (count($images) > 0 ? $images[0]['url'] : null);
        $row['images'] = $images;
        
        // Remove the raw path as we're using image_url
        unset($row['image_path']);
        
        $products[] = $row;
    }
    
    return $products;
}

// Handle different HTTP methods
switch ($requestMethod) {
    case 'GET':
        if ($productId) {
            // Get single product with all details
            try {
                $product = getProductById($db, $productId);
                
                if (!$product) {
                    Response::notFound('Product not found');
                }
                
                Response::success('Product retrieved successfully', $product);
                
            } catch (Exception $e) {
                error_log("Error fetching product: " . $e->getMessage());
                Response::error('Failed to fetch product');
            }
        } else {
            // Get products with optional filters
            try {
                // Get query parameters
                $filters = [];
                
                // Handle isActive filter
                if (isset($_GET['isActive'])) {
                    $filters['isActive'] = filter_var($_GET['isActive'], FILTER_VALIDATE_BOOLEAN);
                }
                
                // Get products with filters
                $products = getAllProducts($db, $filters);
                
                // Add pagination info
                $response = [
                    'data' => $products,
                    'pagination' => [
                        'total' => count($products),
                        'page' => isset($_GET['page']) ? (int)$_GET['page'] : 1,
                        'limit' => isset($_GET['limit']) ? (int)$_GET['limit'] : count($products),
                        'pages' => 1 // Will be calculated if implementing server-side pagination
                    ]
                ];
                
                Response::success('Products retrieved successfully', $response);
                
            } catch (Exception $e) {
                error_log("Error fetching products: " . $e->getMessage());
                Response::error('Failed to fetch products: ' . $e->getMessage());
            }
        }
        break;
        
    case 'POST':
        // Create new product (requires authentication)
        if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
            Response::unauthorized('Authentication required');
        }
        
        $data = $requestData;
        
        // Validate input
        $required = ['code', 'name', 'germanName', 'category', 'price'];
        $missing = [];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $missing[] = $field;
            }
        }
        
        if (!empty($missing)) {
            Response::badRequest('Missing required fields: ' . implode(', ', $missing));
        }
        
        try {
            $db->beginTransaction();
            
            // Insert product
            $query = "INSERT INTO products 
                      (code, name, german_name, category_en, category, price, description)
                      VALUES (:code, :name, :germanName, :category, :category_de, :price, :description)";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':code', $data['code']);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':germanName', $data['germanName']);
            $stmt->bindParam(':category', $data['category']);
            $stmt->bindParam(':category_de', $data['category_de'] ?? $data['category']);
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':description', $data['description'] ?? null);
            
            if (!$stmt->execute()) {
                throw new PDOException('Failed to insert product');
            }
            
            $productId = $db->lastInsertId();
            
            // Handle images if provided
            if (!empty($data['images'])) {
                $query = "INSERT INTO product_images 
                          (product_id, image_url, alt_text, is_primary, sort_order)
                          VALUES (:product_id, :image_url, :alt_text, :is_primary, :sort_order)";
                
                $stmt = $db->prepare($query);
                
                foreach ($data['images'] as $index => $image) {
                    $isPrimary = $index === 0 ? 1 : 0;
                    $sortOrder = $index;
                    
                    $stmt->bindValue(':product_id', $productId);
                    $stmt->bindValue(':image_url', $image['url']);
                    $stmt->bindValue(':alt_text', $image['alt'] ?? '');
                    $stmt->bindValue(':is_primary', $isPrimary);
                    $stmt->bindValue(':sort_order', $sortOrder);
                    
                    if (!$stmt->execute()) {
                        throw new PDOException('Failed to insert product image');
                    }
                }
            }
            
            $db->commit();
            
            // Get the created product
            $query = "SELECT * FROM products WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $productId);
            $stmt->execute();
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            Response::created('Product created successfully', $product);
            
        } catch (PDOException $e) {
            $db->rollBack();
            Response::error('Failed to create product', $e->getMessage());
        }
        break;
        
    case 'PUT':
        // Update product (requires authentication)
        if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
            Response::unauthorized('Authentication required');
        }
        
        if (!$productId) {
            Response::badRequest('Product ID is required');
        }
        
        $data = $requestData;
        
        try {
            $db->beginTransaction();
            
            // Update product
            $query = "UPDATE products SET 
                      code = COALESCE(:code, code),
                      name = COALESCE(:name, name),
                      german_name = COALESCE(:germanName, german_name),
                      category_en = COALESCE(:category, category_en),
                      category = COALESCE(:category_de, category),
                      price = COALESCE(:price, price),
                      description = COALESCE(:description, description)
                      WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindValue(':code', $data['code'] ?? null);
            $stmt->bindValue(':name', $data['name'] ?? null);
            $stmt->bindValue(':germanName', $data['germanName'] ?? null);
            $stmt->bindValue(':category', $data['category'] ?? null);
            $stmt->bindValue(':category_de', $data['category_de'] ?? null);
            $stmt->bindValue(':price', $data['price'] ?? null);
            $stmt->bindValue(':description', $data['description'] ?? null);
            $stmt->bindValue(':id', $productId);
            
            if (!$stmt->execute()) {
                throw new PDOException('Failed to update product');
            }
            
            // Handle images if provided
            if (isset($data['images'])) {
                // First, delete existing images
                $query = "DELETE FROM product_images WHERE product_id = :product_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':product_id', $productId);
                $stmt->execute();
                
                // Then insert new images
                if (!empty($data['images'])) {
                    $query = "INSERT INTO product_images 
                              (product_id, image_url, alt_text, is_primary, sort_order)
                              VALUES (:product_id, :image_url, :alt_text, :is_primary, :sort_order)";
                    
                    $stmt = $db->prepare($query);
                    
                    foreach ($data['images'] as $index => $image) {
                        $isPrimary = $index === 0 ? 1 : 0;
                        $sortOrder = $index;
                        
                        $stmt->bindValue(':product_id', $productId);
                        $stmt->bindValue(':image_url', $image['url']);
                        $stmt->bindValue(':alt_text', $image['alt'] ?? '');
                        $stmt->bindValue(':is_primary', $isPrimary);
                        $stmt->bindValue(':sort_order', $sortOrder);
                        
                        if (!$stmt->execute()) {
                            throw new PDOException('Failed to update product images');
                        }
                    }
                }
            }
            
            $db->commit();
            
            Response::success('Product updated successfully');
            
        } catch (PDOException $e) {
            $db->rollBack();
            Response::error('Failed to update product', $e->getMessage());
        }
        break;
        
    case 'DELETE':
        // Delete product (requires authentication)
        if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
            Response::unauthorized('Authentication required');
        }
        
        if (!$productId) {
            Response::badRequest('Product ID is required');
        }
        
        try {
            $db->beginTransaction();
            
            // Delete product images first (due to foreign key constraint)
            $query = "DELETE FROM product_images WHERE product_id = :product_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':product_id', $productId);
            $stmt->execute();
            
            // Then delete the product
            $query = "DELETE FROM products WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $productId);
            
            if ($stmt->execute() && $stmt->rowCount() > 0) {
                $db->commit();
                Response::noContent();
            } else {
                throw new PDOException('Product not found or already deleted');
            }
            
        } catch (PDOException $e) {
            $db->rollBack();
            Response::error('Failed to delete product', $e->getMessage());
        }
        break;
        
    default:
        Response::methodNotAllowed();
}
