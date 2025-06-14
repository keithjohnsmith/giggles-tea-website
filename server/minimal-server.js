const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Minimal server is working' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const PORT = 5002;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server running on http://localhost:${PORT}`);
  console.log('Test with: curl http://localhost:5002/api/health');
});

server.on('error', (error) => {
  console.error('Server error:', error);
});
