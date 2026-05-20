const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await db.query(`ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin', 'superadmin') DEFAULT 'user'`);
    await db.query(`UPDATE users SET role = 'superadmin' WHERE email = 'super@example.com'`);
    console.log('User role ENUM updated successfully');
  } catch (error) {
    console.error('Error updating ENUM:', error);
  }
  process.exit(0);
}

run();
