<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

// Only handle POST requests for login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && strpos($requestUri, '/api/auth/login') !== false) {
    // Get request data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (empty($data['email']) || empty($data['password'])) {
        Response::badRequest('Email and password are required');
    }
    
    $email = $data['email'];
    $password = $data['password'];
    
    try {
        // Check if user exists
        $query = "SELECT id, email, password, name FROM users WHERE email = :email LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            Response::unauthorized('Invalid email or password');
        }
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verify password (in a real app, use password_verify() with hashed passwords)
        if ($password === $user['password']) { // Replace with proper password verification in production
            // Generate a simple token (in production, use JWT or similar)
            $token = bin2hex(random_bytes(32));
            
            // Store token in database (simplified example)
            $query = "UPDATE users SET api_token = :token WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':token', $token);
            $stmt->bindParam(':id', $user['id']);
            $stmt->execute();
            
            // Return success response with token
            Response::success('Login successful', [
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email']
                ]
            ]);
        } else {
            Response::unauthorized('Invalid email or password');
        }
    } catch (PDOException $e) {
        Response::error('Database error', $e->getMessage());
    }
} else {
    Response::methodNotAllowed();
}
