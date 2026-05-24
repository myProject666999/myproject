module.exports = {
  port: 3001,
  db: {
    type: 'mysql',
    mysql: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'bookmark_collection',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    },
    sqlite: {
      file: './data/bookmark.db'
    }
  },
  fetch: {
    timeout: 8000,
    maxRedirects: 3
  },
  scheduler: {
    checkInterval: '0 0 */6 * * *'
  }
};
