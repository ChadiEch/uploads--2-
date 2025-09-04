const { sequelize, Department, Employee, Task } = require('../models');
require('dotenv').config();

const seedData = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    // Create departments
    const departments = await Department.bulkCreate([
      {
        name: 'Engineering',
        description: 'Software development and technical operations',
        budget: 500000.00
      },
      {
        name: 'Marketing',
        description: 'Marketing and brand management',
        budget: 200000.00
      },
      {
        name: 'Sales',
        description: 'Sales and customer relations',
        budget: 300000.00
      },
      {
        name: 'Human Resources',
        description: 'Employee management and recruitment',
        budget: 150000.00
      }
    ]);
    console.log('✅ Departments created');

    // Create employees individually to trigger password hashing
    const employeeData = [
      {
        email: 'admin@company.com',
        password: 'admin123',
        name: 'Admin User',
        position: 'System Administrator',
        department_id: departments[0].id,
        role: 'admin',
        phone: '+1-555-0001',
        hire_date: new Date('2020-01-01'),
        salary: 120000.00
      },
      {
        email: 'john.doe@company.com',
        password: 'password123',
        name: 'John Doe',
        position: 'Senior Developer',
        department_id: departments[0].id,
        role: 'employee',
        phone: '+1-555-0002',
        hire_date: new Date('2021-03-15'),
        salary: 95000.00
      },
      {
        email: 'jane.smith@company.com',
        password: 'password123',
        name: 'Jane Smith',
        position: 'Marketing Manager',
        department_id: departments[1].id,
        role: 'manager',
        phone: '+1-555-0003',
        hire_date: new Date('2020-06-01'),
        salary: 85000.00
      },
      {
        email: 'mike.johnson@company.com',
        password: 'password123',
        name: 'Mike Johnson',
        position: 'Sales Representative',
        department_id: departments[2].id,
        role: 'employee',
        phone: '+1-555-0004',
        hire_date: new Date('2022-01-10'),
        salary: 65000.00
      },
      {
        email: 'sarah.wilson@company.com',
        password: 'password123',
        name: 'Sarah Wilson',
        position: 'HR Specialist',
        department_id: departments[3].id,
        role: 'employee',
        phone: '+1-555-0005',
        hire_date: new Date('2021-09-20'),
        salary: 70000.00
      }
    ];

    const employees = [];
    for (const empData of employeeData) {
      const employee = await Employee.create(empData);
      employees.push(employee);
    }
    console.log('✅ Employees created');

    // Update department managers
    await departments[0].update({ manager_id: employees[0].id });
    await departments[1].update({ manager_id: employees[2].id });
    console.log('✅ Department managers assigned');

    // Create sample tasks
    const tasks = await Task.bulkCreate([
      {
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication to the application',
        assigned_to: employees[1].id,
        created_by: employees[0].id,
        department_id: departments[0].id,
        status: 'in-progress',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        start_date: new Date(),
        estimated_hours: 16,
        tags: ['authentication', 'security', 'backend']
      },
      {
        title: 'Design marketing campaign',
        description: 'Create a comprehensive marketing campaign for Q4',
        assigned_to: employees[2].id,
        created_by: employees[0].id,
        department_id: departments[1].id,
        status: 'planned',
        priority: 'medium',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        estimated_hours: 40,
        tags: ['marketing', 'campaign', 'Q4']
      },
      {
        title: 'Update customer database',
        description: 'Clean and update the customer contact information',
        assigned_to: employees[3].id,
        created_by: employees[2].id,
        department_id: departments[2].id,
        status: 'completed',
        priority: 'low',
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        completed_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        estimated_hours: 8,
        actual_hours: 6,
        tags: ['database', 'customers', 'maintenance']
      },
      {
        title: 'Conduct employee interviews',
        description: 'Interview candidates for the new developer position',
        assigned_to: employees[4].id,
        created_by: employees[0].id,
        department_id: departments[3].id,
        status: 'in-progress',
        priority: 'high',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        start_date: new Date(),
        estimated_hours: 12,
        tags: ['recruitment', 'interviews', 'hiring']
      },
      {
        title: 'Fix mobile responsive issues',
        description: 'Resolve mobile display problems on the main website',
        assigned_to: employees[1].id,
        created_by: employees[2].id,
        department_id: departments[0].id,
        status: 'planned',
        priority: 'urgent',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        estimated_hours: 6,
        tags: ['frontend', 'mobile', 'responsive', 'bug-fix']
      }
    ]);
    console.log('✅ Sample tasks created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Employee: john.doe@company.com / password123');
    console.log('Manager: jane.smith@company.com / password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

seedData();