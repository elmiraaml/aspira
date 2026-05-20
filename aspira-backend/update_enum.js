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
    await db.query(`ALTER TABLE reports MODIFY COLUMN status ENUM('pending', 'process', 'diproses', 'diperiksa', 'diverifikasi', 'tindak_lanjut', 'completed', 'selesai', 'rejected', 'ditolak') DEFAULT 'pending'`);
    console.log('ENUM updated successfully');
  } catch (error) {
    console.error('Error updating ENUM:', error);
  }
  process.exit(0);
}

run();
