const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initializeDatabase() {
  console.log('🔍 Checking database connection...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if users table exists and has data
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    if (userCount === 0) {
      console.log('🌱 No users found, seeding database...');
      await seedDatabase();
    } else {
      console.log('✅ Database already populated');
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    if (error.code === 'P2021') {
      console.log('🔧 Database schema not found, attempting migration...');
      // In production, you'd run: npx prisma migrate deploy
      console.log('⚠️ Please run database migrations manually');
    }
    
    throw error;
  }
}

async function seedDatabase() {
  console.log('🌱 Creating initial admin user...');
  
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  
  try {
    const admin = await prisma.user.create({
      data: {
        employeeId: 'ADMIN001',
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@oswayo.com',
        password: hashedPassword,
        role: 'DISTRICT_ADMIN',
        department: 'Administration',
        building: 'District Office',
        active: true
      }
    });
    
    console.log('✅ Admin user created:', admin.email);
    return admin;
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Admin user already exists');
    } else {
      throw error;
    }
  }
}

module.exports = { initializeDatabase, seedDatabase };
