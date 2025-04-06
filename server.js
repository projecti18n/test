// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const neo4j = require('neo4j-driver');

// Neo4j connection configuration
const driver = neo4j.driver(
    'neo4j+s://4ce43095.databases.neo4j.io', // Connection URI (update as needed)
    neo4j.auth.basic('neo4j', '2ZuptZocIcO8_QoiE_mBRSpV-80vkKMoI0qjteVL-K0') // Default credentials (update these!)
);

// Create and configure the server
const server = http.createServer((req, res) => {
    // Serve the HTML form for GET requests to the root URL
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading the form');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } 
    // Handle form submission
    else if (req.method === 'POST' && req.url === '/submit') {
        const form = new formidable.IncomingForm();
        
        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.writeHead(500);
                res.end('Error parsing form data');
                return;
            }
            
            const name = fields.name;
            
            try {
                // Save name to Neo4j
                const session = driver.session();
                try {
                    const result = await session.run(
                        'CREATE (p:Person {name: $nameParam}) RETURN p',
                        { nameParam: name }
                    );
                    
                    // Get the created node
                    const createdNode = result.records[0].get('p');
                    
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <html>
                            <head>
                                <title>Success</title>
                                <style>
                                    body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; }
                                    .success { color: green; }
                                    a { display: inline-block; margin-top: 20px; }
                                </style>
                            </head>
                            <body>
                                <h1 class="success">Success!</h1>
                                <p>Name "${name}" has been saved to the Neo4j database.</p>
                                <a href="/">Submit another name</a>
                            </body>
                        </html>
                    `);
                } finally {
                    await session.close();
                }
            } catch (error) {
                console.error('Database error:', error);
                res.writeHead(500);
                res.end('Error saving to database');
            }
        });
    } else {
        // Handle 404 for any other routes
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});