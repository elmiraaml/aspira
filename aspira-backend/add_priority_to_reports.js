const db = require('./src/config/db');

async function addPriorityColumn() {
  try {
    console.log('Adding priority column to reports table...');
    await db.query(`
      ALTER TABLE reports 
      ADD COLUMN priority ENUM('low', 'medium', 'high') DEFAULT 'low'
    `);
    console.log('Priority column added successfully!');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists.');
      process.exit(0);
    }
    console.error('Error:', error);
    process.exit(1);
  }
}

addPriorityColumn();
