const neo4j = require('neo4j-driver')

const cnx = {
    user: 'neo4j',
    password: 'let65HsoNU6NkanRlMPUNSJcbQoRy_cGxwKVOXe_GO4',
    uri: 'neo4j+s://8b9860e8.databases.neo4j.io'
}

const driver = neo4j.driver(cnx.uri, neo4j.auth.basic(cnx.user, cnx.password))
driver.verifyConnectivity()
    .then((cnxMsg) => {
        console.log(cnxMsg)
    })

const session = driver.session({ database: 'neo4j' })

session.run('(charlie:Person {name: 'Charlie Sheen', bornIn: 'New York', chauffeurName: 'John Brown'}),
(martin:Person {name: 'Martin Sheen', bornIn: 'Ohio', chauffeurName: 'Bob Brown'}),
(michael:Person {name: 'Michael Douglas', bornIn: 'New Jersey', chauffeurName: 'John Brown'}),
(oliver:Person {name: 'Oliver Stone', bornIn: 'New York', chauffeurName: 'Bill White'}),
(rob:Person {name: 'Rob Reiner', bornIn: 'New York', chauffeurName: 'Ted Green'}),
(wallStreet:Movie {title: 'Wall Street'}),
(theAmericanPresident:Movie {title: 'The American President'}),
(charlie)-[:ACTED_IN]->(wallStreet),
(martin)-[:ACTED_IN]->(wallStreet),
(michael)-[:ACTED_IN]->(wallStreet),
(martin)-[:ACTED_IN]->(theAmericanPresident),
(michael)-[:ACTED_IN]->(theAmericanPresident),
(oliver)-[:DIRECTED]->(wallStreet),
(rob)-[:DIRECTED]->(theAmericanPresident)')
    .subscribe({
        onKeys: keys => {
            console.log(keys)
        },
        onNext: record => {
            console.log(record.get('p1').properties.title)
        },
        onCompleted: () => {
            session.close()
        },
        onError: error => {
            console.error(error) 
        }
    })