// Comprehensive staff directory and management data
const staffDirectory = {
  'admin@oswayo.com': {
    id: 'admin-001',
    employeeId: 'EMP001',
    email: 'admin@oswayo.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'DISTRICT_ADMIN',
    department: 'Administration', 
    building: 'District Office',
    hireDate: '2020-01-15',
    phoneNumber: '814-555-0101',
    manager: null,
    active: true
  },
  'superintendent@oswayo.com': {
    id: 'supt-001',
    employeeId: 'EMP002', 
    email: 'superintendent@oswayo.com',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    role: 'DISTRICT_ADMIN',
    department: 'Superintendent Office',
    building: 'District Office',
    hireDate: '2018-07-01',
    phoneNumber: '814-555-0102',
    manager: null,
    active: true
  },
  'principal.elementary@oswayo.com': {
    id: 'prin-elem-001',
    employeeId: 'EMP003',
    email: 'principal.elementary@oswayo.com', 
    firstName: 'Michael',
    lastName: 'Thompson',
    role: 'PRINCIPAL',
    department: 'Elementary Administration',
    building: 'Elementary School',
    hireDate: '2019-08-01',
    phoneNumber: '814-555-0103',
    manager: 'supt-001',
    active: true
  },
  'principal.highschool@oswayo.com': {
    id: 'prin-hs-001',
    employeeId: 'EMP004',
    email: 'principal.highschool@oswayo.com',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    role: 'PRINCIPAL', 
    department: 'High School Administration',
    building: 'High School',
    hireDate: '2020-08-01',
    phoneNumber: '814-555-0104',
    manager: 'supt-001',
    active: true
  },
  'math.teacher@oswayo.com': {
    id: 'teach-math-001',
    employeeId: 'EMP005',
    email: 'math.teacher@oswayo.com',
    firstName: 'Robert',
    lastName: 'Wilson',
    role: 'FACULTY',
    department: 'Mathematics',
    building: 'High School', 
    hireDate: '2021-08-15',
    phoneNumber: '814-555-0105',
    manager: 'prin-hs-001',
    active: true
  },
  'alice.teacher@oswayo.com': {
    id: 'teach-elem-001',
    employeeId: 'EMP006',
    email: 'alice.teacher@oswayo.com',
    firstName: 'Alice',
    lastName: 'Cooper',
    role: 'FACULTY',
    department: '3rd Grade',
    building: 'Elementary School',
    hireDate: '2022-08-20',
    phoneNumber: '814-555-0106', 
    manager: 'prin-elem-001',
    active: true
  },
  'secretary.district@oswayo.com': {
    id: 'staff-sec-001',
    employeeId: 'EMP007',
    email: 'secretary.district@oswayo.com',
    firstName: 'Mary',
    lastName: 'Davis',
    role: 'STAFF',
    department: 'Administration',
    building: 'District Office',
    hireDate: '2020-09-01',
    phoneNumber: '814-555-0107',
    manager: 'admin-001',
    active: true
  },
  'custodian.main@oswayo.com': {
    id: 'staff-cust-001', 
    employeeId: 'EMP008',
    email: 'custodian.main@oswayo.com',
    firstName: 'James',
    lastName: 'Brown',
    role: 'STAFF',
    department: 'Maintenance',
    building: 'All Buildings',
    hireDate: '2019-06-15',
    phoneNumber: '814-555-0108',
    manager: 'admin-001',
    active: true
  },
  'nurse.school@oswayo.com': {
    id: 'staff-nurse-001',
    employeeId: 'EMP009',
    email: 'nurse.school@oswayo.com',
    firstName: 'Patricia',
    lastName: 'White', 
    role: 'STAFF',
    department: 'Health Services',
    building: 'Elementary School',
    hireDate: '2021-01-10',
    phoneNumber: '814-555-0109',
    manager: 'prin-elem-001',
    active: true
  },
  'librarian@oswayo.com': {
    id: 'staff-lib-001',
    employeeId: 'EMP010',
    email: 'librarian@oswayo.com',
    firstName: 'Linda',
    lastName: 'Garcia',
    role: 'FACULTY',
    department: 'Library Services',
    building: 'High School',
    hireDate: '2020-02-01',
    phoneNumber: '814-555-0110',
    manager: 'prin-hs-001',
    active: true
  }
};

// Mock timecard data
const mockTimeCards = [
  {
    id: 'tc-001',
    employeeId: 'EMP007',
    employee: staffDirectory['secretary.district@oswayo.com'],
    periodStart: '2026-02-10',
    periodEnd: '2026-02-14', 
    status: 'SUBMITTED',
    totalHours: 40,
    submittedAt: '2026-02-14T17:00:00Z',
    entries: [
      { date: '2026-02-10', timeIn: '08:00', timeOut: '16:00', hours: 8 },
      { date: '2026-02-11', timeIn: '08:00', timeOut: '16:00', hours: 8 },
      { date: '2026-02-12', timeIn: '08:00', timeOut: '16:00', hours: 8 },
      { date: '2026-02-13', timeIn: '08:00', timeOut: '16:00', hours: 8 },
      { date: '2026-02-14', timeIn: '08:00', timeOut: '16:00', hours: 8 }
    ]
  },
  {
    id: 'tc-002', 
    employeeId: 'EMP008',
    employee: staffDirectory['custodian.main@oswayo.com'],
    periodStart: '2026-02-10',
    periodEnd: '2026-02-14',
    status: 'SUBMITTED',
    totalHours: 40,
    submittedAt: '2026-02-14T16:30:00Z',
    entries: [
      { date: '2026-02-10', timeIn: '06:00', timeOut: '14:00', hours: 8 },
      { date: '2026-02-11', timeIn: '06:00', timeOut: '14:00', hours: 8 },
      { date: '2026-02-12', timeIn: '06:00', timeOut: '14:00', hours: 8 },
      { date: '2026-02-13', timeIn: '06:00', timeOut: '14:00', hours: 8 },
      { date: '2026-02-14', timeIn: '06:00', timeOut: '14:00', hours: 8 }
    ]
  }
];

// Mock time off requests
const mockTimeOffRequests = [
  {
    id: 'tor-001',
    employeeId: 'EMP005',
    employee: staffDirectory['math.teacher@oswayo.com'],
    startDate: '2026-03-15',
    endDate: '2026-03-15',
    type: 'SICK',
    reason: 'Doctor appointment',
    status: 'PENDING',
    createdAt: '2026-02-15T10:00:00Z'
  },
  {
    id: 'tor-002',
    employeeId: 'EMP009',
    employee: staffDirectory['nurse.school@oswayo.com'],
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    type: 'VACATION',
    reason: 'Family vacation',
    status: 'PENDING', 
    createdAt: '2026-02-16T14:00:00Z'
  }
];

module.exports = {
  staffDirectory,
  mockTimeCards,
  mockTimeOffRequests
};
