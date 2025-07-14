<?php
/**
 * Products API Endpoint (Fixed Version)
 * 
 * This file serves as the main API endpoint for product-related operations.
 * It handles GET requests to retrieve products with filtering, pagination,
 * and detailed product information including images.
 * 
 * This version is fixed to match the actual database schema.
 */

// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
header("Content-Type: application/json; charset=UTF-8");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database configuration
require_once __DIR__ . '/../server/config/database.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Get query parameters
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
    $featured = isset($_GET['featured']) ? (bool)$_GET['featured'] : false;
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $search = isset($_GET['search']) ? $_GET['search'] : null;
    
    // Calculate offset for pagination
    $offset = ($page - 1) * $limit;
    
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
    $params = [];
    
    // Add specific product ID filter if provided
    if ($id !== null) {
        $whereClause .= " AND p.id = ?";
        $params[] = $id;
    }
    
    // Add featured filter if requested
    if ($featured) {
        $whereClause .= " AND p.is_featured = 1";
    }
    
    // Add category filter if provided
    if ($category !== null) {
        $whereClause .= " AND (c.slug = ? OR c.id = ?)";
        $params[] = $category;
        $params[] = $category;
    }
    
    // Add search filter if provided
    if ($search !== null) {
        $whereClause .= " AND (p.name LIKE ? OR p.german_name LIKE ? OR p.description LIKE ?)";
        $searchParam = "%{$search}%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }
    
    // Construct the main query
    $query = "SELECT {$selectFields} FROM {$fromClause} WHERE {$whereClause} GROUP BY p.id";
    
    // Add sorting
    $query .= " ORDER BY p.name ASC";
    
    // Add pagination
    if ($id === null) {
        $query .= " LIMIT ?, ?";
        $params[] = $offset;
        $params[] = $limit;
    }
    
    // Prepare and execute the query
    $stmt = mysqli_prepare($db, $query);
    
    if ($stmt) {
        // Bind parameters if there are any
        if (!empty($params)) {
            $types = str_repeat('s', count($params));
            mysqli_stmt_bind_param($stmt, $types, ...$params);
        }
        
        // Execute the query
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
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
        
        // Count total products for pagination
        $countQuery = "SELECT COUNT(DISTINCT p.id) as total FROM {$fromClause} WHERE {$whereClause}";
        $countStmt = mysqli_prepare($db, $countQuery);
        
        if (!empty($params)) {
            // Remove pagination parameters
            if ($id === null) {
                array_pop($params); // Remove limit
                array_pop($params); // Remove offset
            }
            $types = str_repeat('s', count($params));
            mysqli_stmt_bind_param($countStmt, $types, ...$params);
        }
        
        mysqli_stmt_execute($countStmt);
        $countResult = mysqli_stmt_get_result($countStmt);
        $countRow = mysqli_fetch_assoc($countResult);
        $totalProducts = $countRow['total'];
        
        // Return success response
        echo json_encode([
            'success' => true,
            'products' => $products,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalProducts,
                'pages' => ceil($totalProducts / $limit)
            ]
        ]);
        
        // Close statements
        mysqli_stmt_close($stmt);
        mysqli_stmt_close($countStmt);
    } else {
        throw new Exception("Failed to prepare statement: " . mysqli_error($db));
    }
} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'query' => $query ?? 'No query executed',
        'mysql_error' => mysqli_error($db)
    ]);
}
?>
