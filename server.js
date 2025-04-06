// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
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
        
        // Get the request body data
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                // Parse the JSON data
                const formData = JSON.parse(body);
                const rows = formData.rows || [];
                
                console.log(`Received ${rows.length} rows of data`);
                
                // Process each row in the Neo4j database
                const processedRows = [];
                const session = driver.session();
                
                try {
                    for (const row of rows) {
                        console.log(`Processing row ${row.rowId}:`, row);
                        
                        // Only process if minimum required fields are present
                        if (!row.id || !row.city) {
                            console.warn(`Row ${row.rowId} missing required fields`);
                            continue;
                        }
                        
                        // Build the Cypher query dynamically based on which name fields are present
                        let query = `
                            MERGE (id:ID {name: $id})
                        `;
                        
                        // Only add NAME1 node and relationship if it exists
                        if (row.name1) {
                            query += `
                                MERGE (name1:NAME {name: $name1})
                                MERGE (id)-[:IS]->(name1)
                            `;
                        }
                        
                        // Only add NAME2 node and relationship if it exists
                        if (row.name2) {
                            query += `
                                MERGE (name2:NAME {name: $name2})
                                MERGE (id)-[:IS]->(name2)
                            `;
                        }
                        
                        // Only add NAME3 node and relationship if it exists
                        if (row.name3) {
                            query += `
                                MERGE (name3:NAME {name: $name3})
                                MERGE (id)-[:IS]->(name3)
                            `;
                        }
                        
                        // Add CITY node and relationship
                        query += `
                            MERGE (city:CITY {name: $city})
                            MERGE (id)-[:IN]->(city)
                            RETURN id, city
                        `;
                        
                        // Execute the query with parameters
                        const result = await session.run(query, {
                            id: row.id.toString(),
                            name1: row.name1 || '',
                            name2: row.name2 || '',
                            name3: row.name3 || '',
                            city: row.city
                        });
                        
                        console.log(`Successfully processed row ${row.rowId}`);
                        processedRows.push(row.rowId);
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        processedRows: processedRows,
                        message: `Successfully processed ${processedRows.length} rows.`
                    }));
                    
                } catch (dbError) {
                    console.error('Database operation error:', dbError);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: `Database error: ${dbError.message}`
                    }));
                } finally {
                    await session.close();
                }
                
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Invalid JSON data'
                }));
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