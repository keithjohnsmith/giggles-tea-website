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
        $userId = getUserIdFromToken();
        
        if (!$userId) {
            Response::unauthorized('Authentication required');
        }
        
        // Check if specific order is requested
        $matches = [];
        if (preg_match('/\/api\/orders\/(\d+)/', $requestUri, $matches)) {
            $orderId = $matches[1];
            
            try {
                // Get order details
                $query = "SELECT o.*, 
                                 (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
                                 (SELECT SUM(price * quantity) FROM order_items WHERE order_id = o.id) as total
                          FROM orders o 
                          WHERE o.id = :order_id AND o.user_id = :user_id";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
                $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $stmt->execute();
                
                if ($stmt->rowCount() === 0) {
                    Response::notFound('Order not found');
                }
                
                $order = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Get order items
                $query = "SELECT oi.*, p.name, p.german_name as germanName, 
                                 (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
                          FROM order_items oi
                          JOIN products p ON oi.product_id = p.id
                          WHERE oi.order_id = :order_id";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
                $stmt->execute();
                
                $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                Response::success('Order retrieved successfully', $order);
                
            } catch (PDOException $e) {
                Response::error('Failed to retrieve order', $e->getMessage());
            }
        } else {
            // Get all user's orders
            try {
                $query = "SELECT o.*, 
                                 (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
                                 (SELECT SUM(price * quantity) FROM order_items WHERE order_id = o.id) as total
                          FROM orders o 
                          WHERE o.user_id = :user_id
                          ORDER BY o.created_at DESC";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $stmt->execute();
                
                $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                Response::success('Orders retrieved successfully', $orders);
                
            } catch (PDOException $e) {
                Response::error('Failed to retrieve orders', $e->getMessage());
            }
        }
        break;
        
    case 'POST':
        // Place a new order
        $userId = getUserIdFromToken();
        
        if (!$userId) {
            Response::unauthorized('Authentication required');
        }
        
        $data = $requestData;
        
        // Validate input
        $required = ['shipping_address', 'billing_address', 'payment_method'];
        $missing = [];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $missing[] = $field;
            }
        }
        
        if (!empty($missing)) {
            Response::badRequest('Missing required fields: ' . implode(', ', $missing));
        }
        
        // Get cart items
        try {
            $db->beginTransaction();
            
            // Get cart items with current prices
            $query = "SELECT c.product_id, c.quantity, p.price, p.name, p.german_name as germanName
                      FROM cart c
                      JOIN products p ON c.product_id = p.id
                      WHERE c.user_id = :user_id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (empty($cartItems)) {
                Response::badRequest('Cart is empty');
            }
            
            // Calculate total
            $total = 0;
            foreach ($cartItems as $item) {
                $total += $item['price'] * $item['quantity'];
            }
            
            // Create order
            $query = "INSERT INTO orders 
                      (user_id, order_number, status, total, shipping_address, billing_address, payment_method, notes)
                      VALUES (:user_id, :order_number, 'pending', :total, :shipping_address, :billing_address, :payment_method, :notes)";
            
            $orderNumber = 'ORD-' . strtoupper(uniqid());
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':order_number', $orderNumber);
            $stmt->bindParam(':total', $total);
            $stmt->bindParam(':shipping_address', $data['shipping_address']);
            $stmt->bindParam(':billing_address', $data['billing_address']);
            $stmt->bindParam(':payment_method', $data['payment_method']);
            $stmt->bindValue(':notes', $data['notes'] ?? null);
            
            if (!$stmt->execute()) {
                throw new PDOException('Failed to create order');
            }
            
            $orderId = $db->lastInsertId();
            
            // Add order items
            $query = "INSERT INTO order_items 
                      (order_id, product_id, product_name, price, quantity)
                      VALUES (:order_id, :product_id, :product_name, :price, :quantity)";
            
            $stmt = $db->prepare($query);
            
            foreach ($cartItems as $item) {
                $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
                $stmt->bindValue(':product_id', $item['product_id'], PDO::PARAM_INT);
                $stmt->bindValue(':product_name', $item['name']);
                $stmt->bindValue(':price', $item['price']);
                $stmt->bindValue(':quantity', $item['quantity'], PDO::PARAM_INT);
                
                if (!$stmt->execute()) {
                    throw new PDOException('Failed to add order items');
                }
                
                // Update product stock (if you track inventory)
                // $query = "UPDATE products SET stock = stock - :quantity WHERE id = :product_id";
                // $updateStmt = $db->prepare($query);
                // $updateStmt->bindValue(':quantity', $item['quantity'], PDO::PARAM_INT);
                // $updateStmt->bindValue(':product_id', $item['product_id'], PDO::PARAM_INT);
                // $updateStmt->execute();
            }
            
            // Clear the cart
            $query = "DELETE FROM cart WHERE user_id = :user_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            $db->commit();
            
            // Get the created order
            $query = "SELECT * FROM orders WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $orderId, PDO::PARAM_INT);
            $stmt->execute();
            
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Send order confirmation email (in a real app)
            // $this->sendOrderConfirmationEmail($order);
            
            Response::created('Order placed successfully', [
                'order_id' => $orderId,
                'order_number' => $orderNumber
            ]);
            
        } catch (PDOException $e) {
            $db->rollBack();
            Response::error('Failed to place order', $e->getMessage());
        }
        break;
        
    default:
        Response::methodNotAllowed();
}
