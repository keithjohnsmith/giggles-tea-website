<?php
/**
 * Products API Endpoint (MySQLi Version)
 * 
 * This file serves as the main API endpoint for product-related operations.
 * It handles GET requests to retrieve products with filtering, pagination,
 * and detailed product information including images.
 * 
 * This version uses MySQLi instead of PDO for better compatibility.
 */

// Allow cross-origin requests
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
// CORS headers are now handled by Apache in .htaccess
// Do not set any CORS headers here to avoid duplication
header("Content-Type: application/json; charset=UTF-8");

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
    // Create database connection using MySQLi
    $mysqli = getMysqliConnection();
    
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
        p.id, 
        p.name, 
        p.german_name, 
        p.slug, 
        p.category_en as category,
        p.price
    ";
    
    $fromClause = "FROM products p";
    $whereClause = "WHERE 1=1";
    $params = [];
    $types = "";
    
    // Add filters to where clause
    if ($id !== null) {
        $whereClause .= " AND p.id = ?";
        $params[] = $id;
        $types .= "i"; // integer
    }
    
    if ($featured) {
        $whereClause .= " AND p.is_featured = 1";
    }
    
    if ($category !== null) {
        $whereClause .= " AND (p.category_en = ? OR p.category_de = ?)";
        $params[] = $category;
        $params[] = $category;
        $types .= "ss"; // two strings
    }
    
    if ($search !== null) {
        $whereClause .= " AND (p.name LIKE ? OR p.german_name LIKE ? OR p.category_en LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "sss"; // three strings
    }
    
    // Count total products matching the criteria (for pagination)
    $countQuery = "SELECT COUNT(*) as total $fromClause $whereClause";
    
    $stmt = $mysqli->prepare($countQuery);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $totalRow = $result->fetch_assoc();
    $total = $totalRow['total'];
    $stmt->close();
    
    // Add pagination to the main query
    $limitClause = "LIMIT ?, ?";
    $params[] = $offset;
    $params[] = $limit;
    $types .= "ii"; // two integers
    
    // Main query to get products
    $query = "SELECT $selectFields $fromClause $whereClause ORDER BY p.name ASC $limitClause";
    
    $stmt = $mysqli->prepare($query);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $products = [];
    
    // Process results
    while ($row = $result->fetch_assoc()) {
        $productId = $row['id'];
        
        // Get images for this product
        $imageQuery = "SELECT image_path, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, position ASC";
        $imageStmt = $mysqli->prepare($imageQuery);
        $imageStmt->bind_param("i", $productId);
        $imageStmt->execute();
        $imageResult = $imageStmt->get_result();
        
        $images = [];
        $primaryImage = null;
        
        while ($imageRow = $imageResult->fetch_assoc()) {
            $imagePath = $imageRow['image_path'];
            $images[] = $imagePath;
            
            if ($imageRow['is_primary'] && $primaryImage === null) {
                $primaryImage = $imagePath;
            }
        }
        
        $imageStmt->close();
        
        // If no primary image was marked, use the first one
        if ($primaryImage === null && !empty($images)) {
            $primaryImage = $images[0];
        }
        
        // Add images to product data
        $row['images'] = $images;
        $row['primary_image'] = $primaryImage;
        
        $products[] = $row;
    }
    
    $stmt->close();
    
    // Prepare response
    $response = [
        'success' => true,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'pages' => ceil($total / $limit),
        'products' => $products
    ];
    
    // Return JSON response
    echo json_encode($response);
    
} catch (Exception $e) {
    // Log error (in production, you'd want to log to a file instead)
    error_log('Database error: ' . $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while processing your request.',
        'error' => $e->getMessage()
    ]);
} finally {
    // Close database connection if it exists
    if (isset($mysqli)) {
        $mysqli->close();
    }
}
