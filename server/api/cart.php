<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

// Get user ID from token (simplified for example)
function getUserIdFromToken() {
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return null;
    }
    
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
    
    // In a real app, validate the token and get user ID
    // For this example, we'll just return a default user ID
    return 1; // Replace with actual user ID from token
}

// Handle different HTTP methods
switch ($requestMethod) {
    case 'GET':
        // Get cart items for the current user
        $userId = getUserIdFromToken();
        
        if (!$userId) {
            Response::unauthorized('Authentication required');
        }
        
        try {
            $query = "SELECT c.id, c.product_id, p.name, p.price, c.quantity, 
                             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
                      FROM cart c
                      JOIN products p ON c.product_id = p.id
                      WHERE c.user_id = :user_id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calculate total
            $total = 0;
            foreach ($items as $item) {
                $total += $item['price'] * $item['quantity'];
            }
            
            Response::success('Cart retrieved successfully', [
                'items' => $items,
                'total' => $total
            ]);
            
        } catch (PDOException $e) {
            Response::error('Failed to retrieve cart', $e->getMessage());
        }
        break;
        
    case 'POST':
        // Add item to cart
        $userId = getUserIdFromToken();
        
        if (!$userId) {
            Response::unauthorized('Authentication required');
        }
        
        $data = $requestData;
        
        // Validate input
        if (empty($data['product_id']) || empty($data['quantity'])) {
            Response::badRequest('Product ID and quantity are required');
        }
        
        $productId = $data['product_id'];
        $quantity = (int)$data['quantity'];
        
        if ($quantity < 1) {
            Response::badRequest('Quantity must be at least 1');
        }
        
        try {
            // Check if product exists
            $query = "SELECT id, price FROM products WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $productId, PDO::PARAM_INT);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                Response::notFound('Product not found');
            }
            
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Check if item already in cart
            $query = "SELECT id, quantity FROM cart WHERE user_id = :user_id AND product_id = :product_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                // Update quantity if item already in cart
                $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);
                $newQuantity = $cartItem['quantity'] + $quantity;
                
                $query = "UPDATE cart SET quantity = :quantity WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':quantity', $newQuantity, PDO::PARAM_INT);
                $stmt->bindParam(':id', $cartItem['id'], PDO::PARAM_INT);
                $stmt->execute();
                
                $message = 'Cart updated successfully';
            } else {
                // Add new item to cart
                $query = "INSERT INTO cart (user_id, product_id, quantity) VALUES (:user_id, :product_id, :quantity)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
                $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
                $stmt->execute();
                
                $message = 'Item added to cart successfully';
            }
            
            Response::success($message);
            
        } catch (PDOException $e) {
            Response::error('Failed to update cart', $e->getMessage());
        }
        break;
        
    case 'PUT':
        // Update cart item quantity
        $userId = getUserIdFromToken();
        
        if (!$userId) {
            Response::unauthorized('Authentication required');
        }
        
        $data = $requestData;
        
        // Validate input
        if (empty($data['cart_item_id']) || !isset($data['quantity'])) {
            Response::badRequest('Cart item ID and quantity are required');
        }
        
        $cartItemId = $data['cart_item_id'];
        $quantity = (int)$data['quantity'];
        
        if ($quantity < 1) {
            // If quantity is 0 or less, remove the item
            $requestMethod = 'DELETE';
            $requestData = ['cart_item_id' => $cartItemId];
            require __FILE__; // Restart the script with DELETE method
            return;
        }
        
        try {
            // Verify the cart item belongs to the user
            $query = "UPDATE cart SET quantity = :quantity 
                      WHERE id = :id AND user_id = :user_id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
            $stmt->bindParam(':id', $cartItemId, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                Response::notFound('Cart item not found or not owned by user');
            }
            
            Response::success('Cart updated successfully');
            
        } catch (PDOException $e) {
            Response::error('Failed to update cart', $e->getMessage());
        }
        break;
        
    case 'DELETE':
        // Remove item from cart
        $userId = getUserIdFromToken();
        
        if (!$userId) {
            Response::unauthorized('Authentication required');
        }
        
        $data = $requestData;
        
        // Validate input
        if (empty($data['cart_item_id'])) {
            Response::badRequest('Cart item ID is required');
        }
        
        $cartItemId = $data['cart_item_id'];
        
        try {
            // Verify the cart item belongs to the user
            $query = "DELETE FROM cart WHERE id = :id AND user_id = :user_id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $cartItemId, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                Response::notFound('Cart item not found or not owned by user');
            }
            
            Response::noContent();
            
        } catch (PDOException $e) {
            Response::error('Failed to remove item from cart', $e->getMessage());
        }
        break;
        
    default:
        Response::methodNotAllowed();
}
