const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.timeCard.deleteMany();
  await prisma.timeOffRequest.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users (default: Admin123!)
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  // Create District Administrator
  const districtAdmin = await prisma.user.create({
    data: {
      employeeId: 'DA001',
      firstName: 'District',
      lastName: 'Administrator',
      email: 'admin@oswayo.com',
      password: hashedPassword,
      role: 'DISTRICT_ADMIN',
      department: 'Administration',
      building: 'District Office',
      phoneNumber: '814-274-8000',
      emergencyContact: 'Emergency Admin Contact',
      emergencyPhone: '814-274-8001',
      active: true
    }
  });

  // Create Principals
  const elementaryPrincipal = await prisma.user.create({
    data: {
      employeeId: 'PR001',
      firstName: 'Elementary',
      lastName: 'Principal',
      email: 'principal.elementary@oswayo.com',
      password: hashedPassword,
      role: 'PRINCIPAL',
      department: 'Administration',
      building: 'Elementary School',
      phoneNumber: '814-274-8010',
      active: true
    }
  });

  const highSchoolPrincipal = await prisma.user.create({
    data: {
      employeeId: 'PR002',
      firstName: 'High School',
      lastName: 'Principal',
      email: 'principal.highschool@oswayo.com',
      password: hashedPassword,
      role: 'PRINCIPAL',
      department: 'Administration',
      building: 'High School',
      phoneNumber: '814-274-8020',
      active: true
    }
  });

  // Create Managers
  const maintenanceManager = await prisma.user.create({
    data: {
      employeeId: 'MG001',
      firstName: 'Maintenance',
      lastName: 'Manager',
      email: 'maintenance.manager@oswayo.com',
      password: hashedPassword,
      role: 'MANAGER',
      department: 'Maintenance',
      building: 'District Wide',
      phoneNumber: '814-274-8030',
      active: true
    }
  });

  const mathDepartmentManager = await prisma.user.create({
    data: {
      employeeId: 'MG002',
      firstName: 'Math Department',
      lastName: 'Manager',
      email: 'math.dept@oswayo.com',
      password: hashedPassword,
      role: 'MANAGER',
      department: 'Mathematics',
      building: 'High School',
      phoneNumber: '814-274-8040',
      active: true
    }
  });

  // Create Full Time Faculty
  const mathTeacher = await prisma.user.create({
    data: {
      employeeId: 'FC001',
      firstName: 'Alice',
      lastName: 'Teacher',
      email: 'alice.teacher@oswayo.com',
      password: hashedPassword,
      role: 'FULL_TIME_FACULTY',
      department: 'Mathematics',
      building: 'High School',
      principalId: highSchoolPrincipal.id,
      phoneNumber: '814-274-8050',
      active: true
    }
  });

  const elementaryTeacher = await prisma.user.create({
    data: {
      employeeId: 'FC002',
      firstName: 'Sarah',
      lastName: 'Elementary',
      email: 'sarah.elementary@oswayo.com',
      password: hashedPassword,
      role: 'FULL_TIME_FACULTY',
      department: 'Elementary',
      building: 'Elementary School',
      principalId: elementaryPrincipal.id,
      phoneNumber: '814-274-8060',
      active: true
    }
  });

  // Create Staff Members
  const custodian = await prisma.user.create({
    data: {
      employeeId: 'ST001',
      firstName: 'James',
      lastName: 'Custodian',
      email: 'james.custodian@oswayo.com',
      password: hashedPassword,
      role: 'STAFF',
      department: 'Maintenance',
      building: 'High School',
      phoneNumber: '814-274-8070',
      active: true
    }
  });

  const secretary = await prisma.user.create({
    data: {
      employeeId: 'ST002',
      firstName: 'Mary',
      lastName: 'Secretary',
      email: 'mary.secretary@oswayo.com',
      password: hashedPassword,
      role: 'STAFF',
      department: 'Office',
      building: 'Elementary School',
      phoneNumber: '814-274-8080',
      active: true
    }
  });

  const substitute = await prisma.user.create({
    data: {
      employeeId: 'ST003',
      firstName: 'John',
      lastName: 'Substitute',
      email: 'john.substitute@oswayo.com',
      password: hashedPassword,
      role: 'STAFF',
      department: 'Substitute Teaching',
      building: 'District Wide',
      phoneNumber: '814-274-8090',
      active: true
    }
  });

  // Connect staff to managers
  await prisma.user.update({
    where: { id: custodian.id },
    data: {
      managers: {
        connect: [{ id: maintenanceManager.id }]
      }
    }
  });

  await prisma.user.update({
    where: { id: secretary.id },
    data: {
      managers: {
        connect: [{ id: elementaryPrincipal.id }]
      }
    }
  });

  // Substitute has multiple managers (works in multiple areas)
  await prisma.user.update({
    where: { id: substitute.id },
    data: {
      managers: {
        connect: [
          { id: elementaryPrincipal.id },
          { id: highSchoolPrincipal.id }
        ]
      }
    }
  });

  // Create sample calendar events
  await prisma.calendarEvent.createMany({
    data: [
      {
        title: 'New Year\'s Day',
        description: 'Federal Holiday - No School',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        type: 'HOLIDAY',
        building: null, // District-wide
        createdBy: districtAdmin.id
      },
      {
        title: 'Professional Development Day',
        description: 'Staff training - No students',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
        type: 'PROFESSIONAL_DEVELOPMENT',
        building: null, // District-wide
        createdBy: districtAdmin.id
      },
      {
        title: 'Parent-Teacher Conferences',
        description: 'Elementary conferences - Early dismissal',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-01'),
        type: 'EARLY_DISMISSAL',
        building: 'Elementary School',
        createdBy: elementaryPrincipal.id
      }
    ]
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('🔐 Default login credentials (all users):');
  console.log('Password: Admin123!');
  console.log('');
  console.log('👤 User accounts created:');
  console.log('  District Admin: admin@oswayo.com');
  console.log('  Elementary Principal: principal.elementary@oswayo.com');
  console.log('  High School Principal: principal.highschool@oswayo.com');
  console.log('  Maintenance Manager: maintenance.manager@oswayo.com');
  console.log('  Math Department Manager: math.dept@oswayo.com');
  console.log('  Math Teacher: alice.teacher@oswayo.com');
  console.log('  Elementary Teacher: sarah.elementary@oswayo.com');
  console.log('  Custodian: james.custodian@oswayo.com');
  console.log('  Secretary: mary.secretary@oswayo.com');
  console.log('  Substitute: john.substitute@oswayo.com');
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
