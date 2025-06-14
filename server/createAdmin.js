const bcrypt = require('bcryptjs');
const db = require('./db');

async function createAdmin() {
  try {
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', ['info@gigglestea.com'], async (err, row) => {
      if (err) {
        console.error('Error checking for existing user:', err);
        return;
      }

      if (row) {
        console.log('User already exists with email: info@gigglestea.com');
        process.exit(0);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash('giggles123', 10);
      
      // Insert the new admin user
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'info@gigglestea.com', hashedPassword, 'admin'],
        (err) => {
          if (err) {
            console.error('Error creating admin user:', err);
            process.exit(1);
          }
          console.log('Admin user created successfully!');
          console.log('Email: info@gigglestea.com');
          console.log('Password: giggles123');
          console.log('Role: admin');
          process.exit(0);
        }
      );
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the function
createAdmin();
