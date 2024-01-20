const http = require('http')
const mysql = require('mysql')
const { promisify } = require('util')

const server = http.createServer(async (_, res) => {
  const connection = mysql.createConnection({
    host: 'db',
    database: 'challenge',
    user: 'root',
    password: 'fullcycle'
  })
  const queryAsync = promisify(connection.query).bind(connection)
  await queryAsync(`
    CREATE TABLE IF NOT EXISTS person (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL
    )
  `)
  try {
    await queryAsync("INSERT INTO person (username) VALUES ('full_cycle')")
    const results = await queryAsync('SELECT * FROM person')
    const userListHTML = renderUsersPage(results)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(userListHTML)
  } catch (err) {
    console.error(err)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  } finally {
    await queryAsync("DROP TABLE person")
    connection.end()
  }
})

const renderUsersPage = (users) => {
  const usersList = users.map(user => `<li>${user.username}</li>`)
  return `
    <h1>Full Cycle Rocks!</h1><ul>
      ${usersList.join('')}
    </ul>
  `
}

const PORT = process.env.PORT || 3000
server.listen(PORT)
