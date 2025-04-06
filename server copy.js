// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { IncomingForm } = require('formidable');
const neo4j = require('neo4j-driver');

// Neo4j connection configuration
const driver = neo4j.driver(
    'neo4j+s://4ce43095.databases.neo4j.io', // Connection URI (update as needed)
    neo4j.auth.basic('neo4j', '2ZuptZocIcO8_QoiE_mBRSpV-80vkKMoI0qjteVL-K0') // Default credentials (update these!)
);

// Create and configure the server
const server = http.createServer((req, res) => {
    console.log(`${req.method} request received for ${req.url}`);
    
    // Serve the HTML form for GET requests to the root URL
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                console.error('Error reading index.html:', err);
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
        console.log('Form submission received');
        
        // Create new form instance
        const form = new IncomingForm({ keepExtensions: true });
        
        // Parse the form
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Form parsing error:', err);
                res.writeHead(500);
                res.end('Error parsing form data');
                return;
            }
            
            console.log('Form fields received:', fields);
            // Handle formidable v4+ or v3- format
            const name = fields.name?.[0] || fields.name;
            
            if (!name) {
                console.error('No name field found in submission');
                res.writeHead(400);
                res.end('Name field is required');
                return;
            }
            
            try {
                // Save name to Neo4j
                const session = driver.session();
                try {
                    console.log(`Saving name "${name}" to Neo4j`);
                    const result = await session.run(
                        'CREATE (p:Person {name: $nameParam}) RETURN p',
                        { nameParam: name }
                    );
                    
                    // Get the created node
                    const createdNode = result.records[0].get('p');
                    console.log('Node created successfully:', createdNode);
                    
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
                res.end('Error saving to database: ' + error.message);
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
    console.log(`Open http://localhost:${PORT} in your browser`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing Neo4j driver...');
    await driver.close();
    process.exit(0);
});