<?php
class Response {
    /**
     * Send a JSON response
     * 
     * @param int $statusCode HTTP status code
     * @param string $message Response message
     * @param array $data Optional data to include in the response
     * @return void
     */
    public static function json($statusCode, $message, $data = []) {
        http_response_code($statusCode);
        
        $response = [
            'status' => $statusCode >= 200 && $statusCode < 300 ? 'success' : 'error',
            'message' => $message,
        ];
        
        if (!empty($data)) {
            $response['data'] = $data;
        }
        
        echo json_encode($response);
        exit();
    }
    
    /**
     * Send a success response (status 200)
     */
    public static function success($message, $data = []) {
        self::json(200, $message, $data);
    }
    
    /**
     * Send a created response (status 201)
     */
    public static function created($message, $data = []) {
        self::json(201, $message, $data);
    }
    
    /**
     * Send a no content response (status 204)
     */
    public static function noContent() {
        http_response_code(204);
        exit();
    }
    
    /**
     * Send a bad request response (status 400)
     */
    public static function badRequest($message = 'Bad Request', $errors = []) {
        $response = ['message' => $message];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        self::json(400, $message, $errors);
    }
    
    /**
     * Send an unauthorized response (status 401)
     */
    public static function unauthorized($message = 'Unauthorized') {
        self::json(401, $message);
    }
    
    /**
     * Send a forbidden response (status 403)
     */
    public static function forbidden($message = 'Forbidden') {
        self::json(403, $message);
    }
    
    /**
     * Send a not found response (status 404)
     */
    public static function notFound($message = 'Resource not found') {
        self::json(404, $message);
    }
    
    /**
     * Send a method not allowed response (status 405)
     */
    public static function methodNotAllowed($message = 'Method not allowed') {
        self::json(405, $message);
    }
    
    /**
     * Send a validation error response (status 422)
     */
    public static function validationError($errors = [], $message = 'Validation failed') {
        self::json(422, $message, ['errors' => $errors]);
    }
    
    /**
     * Send an error response (status 500)
     */
    public static function error($message = 'Internal Server Error', $error = null) {
        $data = [];
        if ($error !== null) {
            $data['error'] = $error;
        }
        self::json(500, $message, $data);
    }
}
