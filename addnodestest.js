const neo4j = require('neo4j-driver');

(async () => {
    const uri = 'neo4j+s://8b9860e8.databases.neo4j.io';
    const user = 'neo4j';
    const password = 'let65HsoNU6NkanRlMPUNSJcbQoRy_cGxwKVOXe_GO4';
  let driver, result

  let people = [{name: 'Alice', age: 42, friends: ['Bob', 'Peter', 'Anna']},
                {name: 'Bob', age: 19},
                {name: 'Peter', age: 50},
                {name: 'Anna', age: 30}]

  // Connect to database
  try {
    driver = neo4j.driver(URI,  neo4j.auth.basic(USER, PASSWORD))
    await driver.verifyConnectivity()
  } catch(err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`)
    await driver.close()
    return
  }

  // Create some nodes
  for(let person of people) {
    await driver.executeQuery(
      'MERGE (p:Person {name: $person.name, age: $person.age})',
      { person: person },
      { database: 'neo4j' }
    )
  }

  // Create some relationships
  for(let person of people) {
    if(person.friends != undefined) {
      await driver.executeQuery(`
        MATCH (p:Person {name: $person.name})
        UNWIND $person.friends AS friendName
        MATCH (friend:Person {name: friendName})
        MERGE (p)-[:KNOWS]->(friend)
        `, { person: person },
        { database: 'neo4j' }
      )
    }
  }

  // Retrieve Alice's friends who are under 40
  result = await driver.executeQuery(`
    MATCH (p:Person {name: $name})-[:KNOWS]-(friend:Person)
    WHERE friend.age < $age
    RETURN friend
    `, { name: 'Alice', age: 40 },
    { database: 'neo4j' }
  )

  // Loop through results and do something with them
  for(let person of result.records) {
    // `person.friend` is an object of type `Node`
    console.log(person.get('friend'))
  }

  // Summary information
  console.log(
    `The query \`${result.summary.query.text}\` ` +
    `returned ${result.records.length} records ` +
    `in ${result.summary.resultAvailableAfter} ms.`
  )

  await driver.close()
})();