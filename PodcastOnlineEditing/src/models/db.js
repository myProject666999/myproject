const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'podcast_editor',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '123456'
        });

        const dbName = process.env.DB_NAME || 'podcast_editor';

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.query(`USE \`${dbName}\``);

        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const statements = schemaSql.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            const trimmed = statement.trim();
            if (!trimmed) continue;
            if (trimmed.toUpperCase().startsWith('CREATE DATABASE') || trimmed.toUpperCase().startsWith('USE') || trimmed.toUpperCase().startsWith('SHOW') || trimmed.toUpperCase().startsWith('INSERT')) {
                try {
                    await connection.query(trimmed);
                } catch (err) {
                    if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
                        console.warn(`Warning: ${err.message}`);
                    }
                }
                continue;
            }
            try {
                await connection.execute(trimmed);
            } catch (err) {
                if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
                    console.warn(`Warning: ${err.message}`);
                }
            }
        }

        await connection.end();
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err.message);
        throw err;
    }
}

async function query(sql, params) {
    const [results] = await pool.execute(sql, params);
    return results;
}

async function getConnection() {
    return await pool.getConnection();
}

module.exports = {
    pool,
    query,
    getConnection,
    initDatabase
};
