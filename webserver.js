const http = require('http');

const express = require('express');
const app = express();

const hostname = '185.194.239.31';
const port = 8080;

// serve files from the public directory
app.use(express.static('/var/www/'));
//app.use(express.static('public'));
// start the express web server listening on 8080
app.listen(8080, () => {
  console.log('listening on 8080');
});

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile('/var/www/index.html');
});

/*const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World5\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});*/