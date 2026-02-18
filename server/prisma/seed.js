const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Oswayo Valley Staff Portal...');

  // Clear existing data
  await prisma.notification.deleteMany({});
  await prisma.timeEntry.deleteMany({});
  await prisma.timeCard.deleteMany({});
  await prisma.timeOffRequest.deleteMany({});
  await prisma.calendarEvent.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  // Create District Administrator
  const districtAdmin = await prisma.user.create({
    data: {
      employeeId: 'DA001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'admin@oswayo.com',
      password: hashedPassword,
      role: 'DISTRICT_ADMIN',
      department: 'Administration',
      building: 'District Office',
      hireDate: new Date('2020-01-01'),
      phoneNumber: '814-555-0001',
    }
  });

  // Create Principals
  const elementaryPrincipal = await prisma.user.create({
    data: {
      employeeId: 'PR001',
      firstName: 'Michael',
      lastName: 'Davis',
      email: 'principal.elementary@oswayo.com',
      password: hashedPassword,
      role: 'PRINCIPAL',
      department: 'Administration',
      building: 'Elementary School',
      hireDate: new Date('2018-07-01'),
      phoneNumber: '814-555-0002',
    }
  });

  const highSchoolPrincipal = await prisma.user.create({
    data: {
      employeeId: 'PR002',
      firstName: 'Jennifer',
      lastName: 'Wilson',
      email: 'principal.highschool@oswayo.com',
      password: hashedPassword,
      role: 'PRINCIPAL',
      department: 'Administration',
      building: 'High School',
      hireDate: new Date('2019-08-01'),
      phoneNumber: '814-555-0003',
    }
  });

  // Create Managers
  const maintenanceManager = await prisma.user.create({
    data: {
      employeeId: 'MG001',
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'maintenance.manager@oswayo.com',
      password: hashedPassword,
      role: 'MANAGER',
      department: 'Maintenance',
      building: 'District Wide',
      hireDate: new Date('2017-05-01'),
      phoneNumber: '814-555-0004',
    }
  });

  const foodServiceManager = await prisma.user.create({
    data: {
      employeeId: 'MG002',
      firstName: 'Linda',
      lastName: 'Garcia',
      email: 'foodservice.manager@oswayo.com',
      password: hashedPassword,
      role: 'MANAGER',
      department: 'Food Service',
      building: 'District Wide',
      hireDate: new Date('2016-08-15'),
      phoneNumber: '814-555-0005',
    }
  });

  // Create Full Time Faculty
  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        employeeId: 'TC001',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.teacher@oswayo.com',
        password: hashedPassword,
        role: 'FULL_TIME_FACULTY',
        department: 'Mathematics',
        building: 'High School',
        principalId: highSchoolPrincipal.id,
        hireDate: new Date('2015-08-20'),
        phoneNumber: '814-555-0010',
      }
    }),
    prisma.user.create({
      data: {
        employeeId: 'TC002',
        firstName: 'David',
        lastName: 'Miller',
        email: 'david.teacher@oswayo.com',
        password: hashedPassword,
        role: 'FULL_TIME_FACULTY',
        department: 'English',
        building: 'High School',
        principalId: highSchoolPrincipal.id,
        hireDate: new Date('2014-08-25'),
        phoneNumber: '814-555-0011',
      }
    }),
    prisma.user.create({
      data: {
        employeeId: 'TC003',
        firstName: 'Emma',
        lastName: 'Taylor',
        email: 'emma.teacher@oswayo.com',
        password: hashedPassword,
        role: 'FULL_TIME_FACULTY',
        department: 'Elementary',
        building: 'Elementary School',
        principalId: elementaryPrincipal.id,
        hireDate: new Date('2016-08-22'),
        phoneNumber: '814-555-0012',
      }
    })
  ]);

  // Create Staff Members
  const staffMembers = await Promise.all([
    // Custodians
    prisma.user.create({
      data: {
        employeeId: 'ST001',
        firstName: 'James',
        lastName: 'Anderson',
        email: 'james.custodian@oswayo.com',
        password: hashedPassword,
        role: 'STAFF',
        department: 'Maintenance',
        building: 'High School',
        hireDate: new Date('2018-06-01'),
        phoneNumber: '814-555-0020',
      }
    }),
    prisma.user.create({
      data: {
        employeeId: 'ST002',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.custodian@oswayo.com',
        password: hashedPassword,
        role: 'STAFF',
        department: 'Maintenance',
        building: 'Elementary School',
        hireDate: new Date('2019-09-15'),
        phoneNumber: '814-555-0021',
      }
    }),
    // Secretaries
    prisma.user.create({
      data: {
        employeeId: 'ST003',
        firstName: 'Nancy',
        lastName: 'White',
        email: 'nancy.secretary@oswayo.com',
        password: hashedPassword,
        role: 'STAFF',
        department: 'Office',
        building: 'High School',
        hireDate: new Date('2017-07-10'),
        phoneNumber: '814-555-0022',
      }
    }),
    // Paraprofessionals
    prisma.user.create({
      data: {
        employeeId: 'ST004',
        firstName: 'Kevin',
        lastName: 'Clark',
        email: 'kevin.para@oswayo.com',
        password: hashedPassword,
        role: 'STAFF',
        department: 'Special Education',
        building: 'Elementary School',
        hireDate: new Date('2020-08-24'),
        phoneNumber: '814-555-0023',
      }
    }),
    // Cafeteria Workers
    prisma.user.create({
      data: {
        employeeId: 'ST005',
        firstName: 'Patricia',
        lastName: 'Lewis',
        email: 'patricia.cafeteria@oswayo.com',
        password: hashedPassword,
        role: 'STAFF',
        department: 'Food Service',
        building: 'High School',
        hireDate: new Date('2019-08-19'),
        phoneNumber: '814-555-0024',
      }
    }),
    prisma.user.create({
      data: {
        employeeId: 'ST006',
        firstName: 'Thomas',
        lastName: 'Hall',
        email: 'thomas.cafeteria@oswayo.com',
        password: hashedPassword,
        role: 'STAFF',
        department: 'Food Service',
        building: 'Elementary School',
        hireDate: new Date('2021-01-15'),
        phoneNumber: '814-555-0025',
      }
    }),
    // Substitute Teacher (Long Term)
    prisma.user.create({
      data: {
        employeeId: 'ST007',
        firstName: 'Michelle',
        lastName: 'Young',
        email: 'michelle.substitute@oswayo.com',
        password: hashedPassword,
        role: 'STAFF',
        department: 'Substitute Teaching',
        building: 'District Wide',
        hireDate: new Date('2023-10-01'),
        phoneNumber: '814-555-0026',
      }
    })
  ]);

  // Set up manager relationships
  const custodians = staffMembers.filter(s => s.department === 'Maintenance');
  const cafeteriaWorkers = staffMembers.filter(s => s.department === 'Food Service');
  const officeStaff = staffMembers.filter(s => s.department === 'Office');
  const paraprofessionals = staffMembers.filter(s => s.department === 'Special Education');
  const substitutes = staffMembers.filter(s => s.department === 'Substitute Teaching');

  // Connect staff to managers
  for (const custodian of custodians) {
    await prisma.user.update({
      where: { id: custodian.id },
      data: {
        managers: {
          connect: { id: maintenanceManager.id }
        }
      }
    });
  }

  for (const worker of cafeteriaWorkers) {
    await prisma.user.update({
      where: { id: worker.id },
      data: {
        managers: {
          connect: { id: foodServiceManager.id }
        }
      }
    });
  }

  // Office staff report to building principals
  for (const staff of officeStaff) {
    const principal = staff.building === 'High School' ? highSchoolPrincipal : elementaryPrincipal;
    await prisma.user.update({
      where: { id: staff.id },
      data: {
        managers: {
          connect: { id: principal.id }
        }
      }
    });
  }

  // Paraprofessionals report to building principals
  for (const para of paraprofessionals) {
    const principal = para.building === 'High School' ? highSchoolPrincipal : elementaryPrincipal;
    await prisma.user.update({
      where: { id: para.id },
      data: {
        managers: {
          connect: { id: principal.id }
        }
      }
    });
  }

  // Substitutes can report to multiple managers (example of multiple manager scenario)
  for (const sub of substitutes) {
    await prisma.user.update({
      where: { id: sub.id },
      data: {
        managers: {
          connect: [
            { id: elementaryPrincipal.id },
            { id: highSchoolPrincipal.id }
          ]
        }
      }
    });
  }

  // Create school calendar events
  const currentYear = new Date().getFullYear();
  const calendarEvents = [
    {
      title: 'Labor Day',
      startDate: new Date(`${currentYear}-09-02`),
      endDate: new Date(`${currentYear}-09-02`),
      type: 'HOLIDAY',
      building: null, // District-wide
      createdBy: districtAdmin.id
    },
    {
      title: 'Thanksgiving Break',
      startDate: new Date(`${currentYear}-11-28`),
      endDate: new Date(`${currentYear}-11-29`),
      type: 'HOLIDAY',
      building: null,
      createdBy: districtAdmin.id
    },
    {
      title: 'Winter Break',
      startDate: new Date(`${currentYear}-12-23`),
      endDate: new Date(`${currentYear + 1}-01-03`),
      type: 'HOLIDAY',
      building: null,
      createdBy: districtAdmin.id
    },
    {
      title: 'Professional Development Day',
      startDate: new Date(`${currentYear}-10-15`),
      endDate: new Date(`${currentYear}-10-15`),
      type: 'PROFESSIONAL_DEVELOPMENT',
      building: null,
      createdBy: districtAdmin.id
    }
  ];

  for (const event of calendarEvents) {
    await prisma.calendarEvent.create({ data: event });
  }

  // Create sample time cards for staff members
  const currentDate = new Date();
  const periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  for (const staff of staffMembers) {
    if (staff.role === 'STAFF') {
      const timeCard = await prisma.timeCard.create({
        data: {
          employeeId: staff.id,
          periodStart,
          periodEnd,
          status: Math.random() > 0.5 ? 'DRAFT' : 'SUBMITTED',
          totalHours: 40
        }
      });

      // Add some sample time entries
      for (let i = 0; i < 5; i++) {
        const entryDate = new Date(periodStart);
        entryDate.setDate(entryDate.getDate() + i);
        
        await prisma.timeEntry.create({
          data: {
            timeCardId: timeCard.id,
            date: entryDate,
            timeIn: new Date(entryDate.setHours(8, 0)),
            timeOut: new Date(entryDate.setHours(16, 0)),
            hours: 8,
            dayType: 'REGULAR'
          }
        });
      }
    }
  }

  // Create sample time off requests
  const sampleTimeOffRequests = [
    {
      employeeId: teachers[0].id,
      startDate: new Date(`${currentYear}-11-15`),
      endDate: new Date(`${currentYear}-11-15`),
      type: 'PERSONAL',
      reason: 'Doctor appointment',
      status: 'PENDING'
    },
    {
      employeeId: staffMembers[0].id,
      startDate: new Date(`${currentYear}-12-20`),
      endDate: new Date(`${currentYear}-12-22`),
      type: 'VACATION',
      reason: 'Family vacation',
      status: 'APPROVED',
      approvedBy: maintenanceManager.id
    }
  ];

  for (const request of sampleTimeOffRequests) {
    await prisma.timeOffRequest.create({ data: request });
  }

  console.log('✅ Database seeded successfully!');
  console.log('🔐 Login credentials:');
  console.log('  District Admin: admin@oswayo.com / Admin123!');
  console.log('  Elementary Principal: principal.elementary@oswayo.com / Admin123!');
  console.log('  High School Principal: principal.highschool@oswayo.com / Admin123!');
  console.log('  Maintenance Manager: maintenance.manager@oswayo.com / Admin123!');
  console.log('  Food Service Manager: foodservice.manager@oswayo.com / Admin123!');
  console.log('  Teacher: alice.teacher@oswayo.com / Admin123!');
  console.log('  Staff: james.custodian@oswayo.com / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
