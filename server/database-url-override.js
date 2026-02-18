// Override DATABASE_URL to use coolify-db
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('@postgres:')) {
  process.env.DATABASE_URL = 'postgresql://oswayo_staff:StaffPortal2024SecurePass!@coolify-db:5432/oswayo_staff_portal';
  console.log('🔧 Updated DATABASE_URL to use coolify-db');
}
