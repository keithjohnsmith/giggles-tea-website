const db = require('./db');

// Add any missing columns to the users table
db.serialize(() => {
  // Add role column if it doesn't exist
  db.run(`
    PRAGMA table_info(users);
  `, (err, rows) => {
    if (err) {
      console.error('Error checking users table:', err);
      return;
    }
    
    const hasRoleColumn = rows.some(col => col.name === 'role');
    
    if (!hasRoleColumn) {
      console.log('Adding role column to users table...');
      db.run('ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT "user"', (err) => {
        if (err) {
          console.error('Error adding role column:', err);
        } else {
          console.log('Successfully added role column to users table');
        }
      });
    } else {
      console.log('Role column already exists in users table');
    }
  });

  // Close the database connection
  db.close();
});
