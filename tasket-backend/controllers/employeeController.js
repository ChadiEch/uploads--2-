const { validationResult } = require('express-validator');
const { Employee, Department, Task } = require('../models');
const { Op } = require('sequelize');

const getEmployees = async (req, res) => {
  try {
    const { department_id, role, is_active } = req.query;
    const where = {};

    if (department_id) where.department_id = department_id;
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const employees = await Employee.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }],
      order: [['name', 'ASC']]
    });

    res.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get task statistics
    const taskStats = await Task.findAll({
      where: { assigned_to: id },
      attributes: [
        'status',
        [Task.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    res.json({ 
      employee,
      taskStats: taskStats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      name,
      position,
      department_id,
      role,
      phone,
      hire_date,
      salary
    } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists with this email' });
    }

    const employee = await Employee.create({
      email,
      password,
      name,
      position,
      department_id,
      role: role || 'employee',
      phone,
      hire_date,
      salary
    });

    const employeeWithDept = await Employee.findByPk(employee.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.status(201).json({
      message: 'Employee created successfully',
      employee: employeeWithDept
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      name,
      position,
      department_id,
      role,
      phone,
      hire_date,
      salary,
      is_active
    } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.update({
      name,
      position,
      department_id,
      role,
      phone,
      hire_date,
      salary,
      is_active
    });

    const updatedEmployee = await Employee.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if employee has assigned tasks
    const taskCount = await Task.count({ where: { assigned_to: id } });
    if (taskCount > 0) {
      // Deactivate instead of delete
      await employee.update({ is_active: false });
      res.json({ message: 'Employee deactivated successfully' });
    } else {
      await employee.destroy();
      res.json({ message: 'Employee deleted successfully' });
    }
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
};