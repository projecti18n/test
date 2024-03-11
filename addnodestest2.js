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
const session.person1Name = "name1";
const session.person2Name = "name2";
session.run('MERGE (p1:test4 {name:$person1Name, age:111})-[:KNOWS]->(p2:test4{name:$person2Name, age:222 })')
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