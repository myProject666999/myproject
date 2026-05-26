const pool = require('./config/database');

pool.query('SHOW TABLES')
  .then(r => {
    console.log('Tables:', r[0]);
    process.exit(0);
  })
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
