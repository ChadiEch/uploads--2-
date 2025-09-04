const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { Employee, Department } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, position, department_id, phone } = req.body;

    // Check if user already exists
    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists with this email' });
    }

    // Create employee
    const employee = await Employee.create({
      email,
      password,
      name,
      position,
      department_id,
      phone,
      role: 'employee'
    });

    // Generate token
    const token = generateToken(employee.id);

    // Get employee with department info
    const employeeWithDept = await Employee.findByPk(employee.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.status(201).json({
      message: 'Employee registered successfully',
      token,
      employee: employeeWithDept
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find employee
    const employee = await Employee.findOne({ 
      where: { email, is_active: true },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    if (!employee) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await employee.checkPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(employee.id);

    // Remove password from response
    const { password: _, ...employeeData } = employee.toJSON();

    res.json({
      message: 'Login successful',
      token,
      employee: employeeData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getProfile = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.json({ employee });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, position, phone } = req.body;
    
    await Employee.update(
      { name, position, phone },
      { where: { id: req.user.id } }
    );

    const updatedEmployee = await Employee.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      message: 'Profile updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};