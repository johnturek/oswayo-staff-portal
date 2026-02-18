const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@oswayo.com' },
    update: {},
    create: {
      email: 'admin@oswayo.com',
      firstName: 'System',
      lastName: 'Administrator',
      employeeId: 'ADMIN001',
      passwordHash: adminPassword,
      role: 'ADMIN',
      department: 'Administration',
      position: 'System Administrator',
      isActive: true,
      hireDate: new Date('2024-01-01')
    }
  });

  console.log(`👑 Created admin user: ${admin.email}`);

  // Create sample principal
  const principalPassword = await bcrypt.hash('Principal123!', 12);
  
  const principal = await prisma.user.upsert({
    where: { email: 'principal@oswayo.com' },
    update: {},
    create: {
      email: 'principal@oswayo.com',
      firstName: 'Jane',
      lastName: 'Zaun',
      employeeId: 'PRIN001',
      passwordHash: principalPassword,
      role: 'MANAGER',
      department: 'Administration',
      position: 'Principal',
      isActive: true,
      hireDate: new Date('2020-07-01')
    }
  });

  console.log(`🏫 Created principal: ${principal.email}`);

  // Create sample department heads/managers
  const managers = [
    {
      email: 'math.dept@oswayo.com',
      firstName: 'John',
      lastName: 'Smith',
      employeeId: 'MATH001',
      department: 'Mathematics',
      position: 'Department Head',
      managerId: principal.id
    },
    {
      email: 'english.dept@oswayo.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      employeeId: 'ENG001',
      department: 'English',
      position: 'Department Head',
      managerId: principal.id
    },
    {
      email: 'science.dept@oswayo.com',
      firstName: 'Michael',
      lastName: 'Brown',
      employeeId: 'SCI001',
      department: 'Science',
      position: 'Department Head',
      managerId: principal.id
    }
  ];

  const createdManagers = [];
  for (const managerData of managers) {
    const password = await bcrypt.hash('Manager123!', 12);
    
    const manager = await prisma.user.upsert({
      where: { email: managerData.email },
      update: {},
      create: {
        ...managerData,
        passwordHash: password,
        role: 'MANAGER',
        isActive: true,
        hireDate: new Date('2021-08-15')
      }
    });
    
    createdManagers.push(manager);
    console.log(`👥 Created manager: ${manager.email}`);
  }

  // Create sample staff members
  const staffMembers = [
    {
      email: 'alice.teacher@oswayo.com',
      firstName: 'Alice',
      lastName: 'Wilson',
      employeeId: 'MATH002',
      department: 'Mathematics',
      position: 'Math Teacher',
      managerId: createdManagers[0].id
    },
    {
      email: 'bob.teacher@oswayo.com',
      firstName: 'Bob',
      lastName: 'Davis',
      employeeId: 'ENG002',
      department: 'English',
      position: 'English Teacher',
      managerId: createdManagers[1].id
    },
    {
      email: 'carol.teacher@oswayo.com',
      firstName: 'Carol',
      lastName: 'Miller',
      employeeId: 'SCI002',
      department: 'Science',
      position: 'Science Teacher',
      managerId: createdManagers[2].id
    },
    {
      email: 'david.teacher@oswayo.com',
      firstName: 'David',
      lastName: 'Garcia',
      employeeId: 'MATH003',
      department: 'Mathematics',
      position: 'Math Teacher',
      managerId: createdManagers[0].id
    }
  ];

  for (const staffData of staffMembers) {
    const password = await bcrypt.hash('Staff123!', 12);
    
    const staff = await prisma.user.upsert({
      where: { email: staffData.email },
      update: {},
      create: {
        ...staffData,
        passwordHash: password,
        role: 'STAFF',
        isActive: true,
        hireDate: new Date('2022-08-15')
      }
    });
    
    console.log(`👤 Created staff member: ${staff.email}`);
  }

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      payPeriodStartDay: 1, // Monday
      payPeriodLength: 14,   // Bi-weekly
      defaultWorkHours: 8.0,
      timeCardReminderDays: 2,
      autoApprovalEnabled: false,
      emailNotifications: true
    }
  });

  console.log('⚙️ Created system settings');

  // Create sample calendar events for the current school year
  const currentYear = new Date().getFullYear();
  const schoolYearStart = new Date(currentYear, 7, 15); // August 15th
  const schoolYearEnd = new Date(currentYear + 1, 5, 15); // June 15th next year

  const calendarEvents = [
    {
      title: 'First Day of School',
      description: 'Welcome back students and staff!',
      date: new Date(currentYear, 7, 20), // August 20th
      dayType: 'REGULAR'
    },
    {
      title: 'Labor Day',
      description: 'Federal Holiday - No School',
      date: getFirstMondayOfMonth(currentYear, 8), // September
      dayType: 'HOLIDAY'
    },
    {
      title: 'Columbus Day',
      description: 'Federal Holiday - No School',
      date: getSecondMondayOfMonth(currentYear, 9), // October
      dayType: 'HOLIDAY'
    },
    {
      title: 'Thanksgiving Break',
      description: 'Thanksgiving Holiday - No School',
      date: getThanksgivingDate(currentYear),
      dayType: 'HOLIDAY'
    },
    {
      title: 'Winter Break Start',
      description: 'Winter Break Begins',
      date: new Date(currentYear, 11, 23), // December 23rd
      dayType: 'HOLIDAY'
    },
    {
      title: "New Year's Day",
      description: 'Federal Holiday - No School',
      date: new Date(currentYear + 1, 0, 1), // January 1st next year
      dayType: 'HOLIDAY'
    },
    {
      title: 'Martin Luther King Jr. Day',
      description: 'Federal Holiday - No School',
      date: getThirdMondayOfMonth(currentYear + 1, 0), // January next year
      dayType: 'HOLIDAY'
    },
    {
      title: "Presidents' Day",
      description: 'Federal Holiday - No School',
      date: getThirdMondayOfMonth(currentYear + 1, 1), // February next year
      dayType: 'HOLIDAY'
    },
    {
      title: 'Memorial Day',
      description: 'Federal Holiday - No School',
      date: getLastMondayOfMonth(currentYear + 1, 4), // May next year
      dayType: 'HOLIDAY'
    },
    {
      title: 'Last Day of School',
      description: 'End of school year',
      date: new Date(currentYear + 1, 5, 10), // June 10th next year
      dayType: 'REGULAR'
    }
  ];

  for (const eventData of calendarEvents) {
    await prisma.calendarEvent.upsert({
      where: { 
        date: eventData.date
      },
      update: {},
      create: {
        ...eventData,
        createdById: admin.id
      }
    });
  }

  console.log(`📅 Created ${calendarEvents.length} calendar events`);

  // Create sample notifications
  const notifications = [
    {
      userId: createdManagers[0].id,
      title: 'Welcome to the Staff Portal',
      message: 'Your account has been created. Please review the time card and calendar features.',
      type: 'system'
    },
    {
      userId: staffMembers[0] ? (await prisma.user.findUnique({ where: { email: staffMembers[0].email } }))?.id : null,
      title: 'Time Card Reminder',
      message: 'Don\'t forget to submit your time card by Friday.',
      type: 'timecard'
    }
  ];

  for (const notificationData of notifications.filter(n => n.userId)) {
    await prisma.notification.create({
      data: notificationData
    });
  }

  console.log(`🔔 Created ${notifications.filter(n => n.userId).length} notifications`);

  console.log('✅ Database seeding completed successfully!');
  
  console.log('\n📋 Sample Accounts Created:');
  console.log('Admin: admin@oswayo.com / Admin123!');
  console.log('Principal: principal@oswayo.com / Principal123!');
  console.log('Manager: math.dept@oswayo.com / Manager123!');
  console.log('Staff: alice.teacher@oswayo.com / Staff123!');
}

// Helper functions for date calculations
function getFirstMondayOfMonth(year, month) {
  const date = new Date(year, month, 1);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function getSecondMondayOfMonth(year, month) {
  const firstMonday = getFirstMondayOfMonth(year, month);
  return new Date(firstMonday.getTime() + 7 * 24 * 60 * 60 * 1000);
}

function getThirdMondayOfMonth(year, month) {
  const firstMonday = getFirstMondayOfMonth(year, month);
  return new Date(firstMonday.getTime() + 14 * 24 * 60 * 60 * 1000);
}

function getLastMondayOfMonth(year, month) {
  const lastDay = new Date(year, month + 1, 0);
  while (lastDay.getDay() !== 1) {
    lastDay.setDate(lastDay.getDate() - 1);
  }
  return lastDay;
}

function getThanksgivingDate(year) {
  // Fourth Thursday in November
  const november = new Date(year, 10, 1); // November 1st
  let thursday = november;
  
  // Find first Thursday
  while (thursday.getDay() !== 4) {
    thursday.setDate(thursday.getDate() + 1);
  }
  
  // Add 3 weeks to get fourth Thursday
  thursday.setDate(thursday.getDate() + 21);
  return thursday;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });