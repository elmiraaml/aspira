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
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_id INT NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('audit_logs created');

    await db.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('activity_logs created');
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
