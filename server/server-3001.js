const http = require('http');

// Mock database
const users = [
  {
    id: 1,
    email: 'admin@example.com',
    username: 'admin',
    role: 'admin',
    password: 'password' // In a real app, this would be hashed
  }
];

const server = http.createServer((req, res) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Request-Method': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  // Helper function to send JSON responses
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, headers);
    res.end(JSON.stringify(data));
  };

  // Helper to parse request body
  const parseBody = (req) => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(null);
        }
      });
    });
  };

  // Handle routes
  const handleRequest = async () => {
    // Health check
    if (req.url === '/api/health' && req.method === 'GET') {
      return sendJson(200, { status: 'ok', message: 'Server is running' });
    }
    
    // Login
    else if (req.url === '/api/auth/login' && req.method === 'POST') {
      const credentials = await parseBody(req);
      if (!credentials || !credentials.email || !credentials.password) {
        return sendJson(400, { error: 'Email and password are required' });
      }
      
      // In a real app, you would validate credentials against the database
      const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
      
      if (!user) {
        return sendJson(401, { error: 'Invalid credentials' });
      }
      
      // Remove password from response
      const { password, ...userData } = user;
      
      return sendJson(200, {
        user: userData,
        token: 'mock-jwt-token-for-testing'
      });
    }
    
    // Get current user profile
    else if (req.url === '/api/me' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return sendJson(401, { error: 'No token provided' });
      }
      
      // In a real app, you would verify the JWT token
      const token = authHeader.split(' ')[1];
      if (token !== 'mock-jwt-token-for-testing') {
        return sendJson(401, { error: 'Invalid token' });
      }
      
      // For demo, return the first user
      const { password, ...userData } = users[0];
      return sendJson(200, { user: userData });
    }
    
    // Get all users (admin only)
    else if (req.url === '/api/admin/users' && req.method === 'GET') {
      // In a real app, verify admin role from token
      return sendJson(200, users.map(({ password, ...user }) => user));
    }
    
    // 404 Not Found
    else {
      return sendJson(404, { error: 'Not Found' });
    }
  };
  
  // Handle the request
  handleRequest().catch(error => {
    console.error('Request error:', error);
    sendJson(500, { error: 'Internal Server Error' });
  });
});

const PORT = 3001;
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log('Test endpoints:');
  console.log(`  GET  http://${HOST}:${PORT}/api/health`);
  console.log(`  POST http://${HOST}:${PORT}/api/auth/login`);
  console.log('    Example body: { "email": "admin@example.com", "password": "password" }');
});

server.on('error', (error) => {
  console.error('Server error:', error);
});
