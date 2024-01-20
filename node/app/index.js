const http = require('http')
const mysql = require('mysql')
const { promisify } = require('util')

const connection = mysql.createConnection({
  host: 'db',
  database: 'challenge',
  user: 'root',
  password: 'fullcycle'
})
const queryAsync = promisify(connection.query).bind(connection)

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      await queryAsync(`
        CREATE TABLE IF NOT EXISTS people (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL
        )
      `)

      await queryAsync("INSERT INTO people (username) VALUES ('full_cycle')")
      const results = await queryAsync('SELECT username FROM people')
      const userListHTML = renderUsersPage(results)
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(userListHTML)
    }
  } catch (err) {
    console.error(err)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

const renderUsersPage = (users) => {
  const usersList = users.map(user => `<li>${user.username}</li>`)
  return `
    <h1>Full Cycle Rocks!</h1>
    <ul>
      ${usersList.join('')}
    </ul>
  `
}

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
