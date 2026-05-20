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
    // Test 1: getAdmins
    const [admins] = await db.query(`
      SELECT id, fullname as full_name, email, role, created_at
      FROM users WHERE role = 'admin' ORDER BY created_at DESC
    `);
    console.log('ADMINS OK:', admins.length, 'rows ->', JSON.stringify(admins[0] || {}));

    // Test 2: getUsers
    const [users] = await db.query(`
      SELECT id, fullname, email, role, created_at
      FROM users WHERE role = 'user' ORDER BY created_at DESC
    `);
    console.log('USERS OK:', users.length, 'rows');

    // Test 3: getAuditLogs
    const [audit] = await db.query(`
      SELECT a.*, r.title as report_title, u.fullname as changed_by_name, u.role as changer_role
      FROM audit_logs a
      LEFT JOIN reports r ON a.report_id = r.id
      LEFT JOIN users u ON a.changed_by = u.id
      ORDER BY a.created_at DESC
    `);
    console.log('AUDIT OK:', audit.length, 'rows');

    // Test 4: getActivityLogs
    const [activity] = await db.query(`
      SELECT a.*, u.fullname as admin_name
      FROM activity_logs a
      LEFT JOIN users u ON a.admin_id = u.id
      ORDER BY a.created_at DESC
    `);
    console.log('ACTIVITY OK:', activity.length, 'rows');
    
    console.log('\nAll queries OK!');
  } catch (err) {
    console.error('ERROR:', err.message);
  }
  process.exit(0);
}

run();
