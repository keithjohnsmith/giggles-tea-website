import { Product, Order, User } from './models';
import logger from '../../utils/logger';

const isDev = process.env.NODE_ENV === 'development';

async function initializeDatabase() {
  try {
    logger.info('Initializing database...');
    
    // Create all indexes
    await Promise.all([
      Product.createIndexes(),
      Order.createIndexes(),
      User.createIndexes()
    ]);
    
    // Check if we need to create initial admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      logger.info('Creating initial admin user...');
      await User.createUser({
        email: adminEmail,
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        roles: ['admin']
      });
      logger.info('Admin user created successfully');
    }
    
    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}

export default initializeDatabase;
