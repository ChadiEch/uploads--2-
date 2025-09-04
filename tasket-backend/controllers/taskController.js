const { validationResult } = require('express-validator');
const { Task, Employee, Department, TaskComment } = require('../models');
const { Op } = require('sequelize');

const getTasks = async (req, res) => {
  try {
    const { status, priority, assigned_to, department_id, start_date, end_date } = req.query;
    const where = {};

    // If not admin, only show tasks assigned to user or created by user
    if (req.user.role !== 'admin') {
      where[Op.or] = [
        { assigned_to: req.user.id },
        { created_by: req.user.id }
      ];
    }

    // Apply filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigned_to) where.assigned_to = assigned_to;
    if (department_id) where.department_id = department_id;
    
    if (start_date && end_date) {
      where.due_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'assignedToEmployee',
          attributes: ['id', 'name', 'email', 'position']
        },
        {
          model: Employee,
          as: 'createdByEmployee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'assignedToEmployee',
          attributes: ['id', 'name', 'email', 'position']
        },
        {
          model: Employee,
          as: 'createdByEmployee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: TaskComment,
          as: 'comments',
          include: [{
            model: Employee,
            as: 'employee',
            attributes: ['id', 'name']
          }],
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    if (req.user.role !== 'admin' && 
        task.assigned_to !== req.user.id && 
        task.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      assigned_to,
      department_id,
      status,
      priority,
      due_date,
      start_date,
      estimated_hours,
      tags
    } = req.body;

    const task = await Task.create({
      title,
      description,
      assigned_to,
      created_by: req.user.id,
      department_id,
      status: status || 'planned',
      priority: priority || 'medium',
      due_date,
      start_date,
      estimated_hours,
      tags: tags || []
    });

    const taskWithDetails = await Task.findByPk(task.id, {
      include: [
        {
          model: Employee,
          as: 'assignedToEmployee',
          attributes: ['id', 'name', 'email', 'position']
        },
        {
          model: Employee,
          as: 'createdByEmployee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ]
    });

    // Emit WebSocket event for real-time updates
    const websocketService = req.app.get('websocketService');
    if (websocketService) {
      websocketService.notifyTaskCreated(taskWithDetails, req.user);
    }

    res.status(201).json({
      message: 'Task created successfully',
      task: taskWithDetails
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      title,
      description,
      assigned_to,
      department_id,
      status,
      priority,
      due_date,
      start_date,
      estimated_hours,
      actual_hours,
      tags
    } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to update this task
    if (req.user.role !== 'admin' && 
        task.assigned_to !== req.user.id && 
        task.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {
      title,
      description,
      assigned_to,
      department_id,
      status,
      priority,
      due_date,
      start_date,
      estimated_hours,
      actual_hours,
      tags
    };

    // Set completed_date if status is completed
    if (status === 'completed' && task.status !== 'completed') {
      updateData.completed_date = new Date();
    } else if (status !== 'completed') {
      updateData.completed_date = null;
    }

    await task.update(updateData);

    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'assignedToEmployee',
          attributes: ['id', 'name', 'email', 'position']
        },
        {
          model: Employee,
          as: 'createdByEmployee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ]
    });

    // Emit WebSocket event for real-time updates
    const websocketService = req.app.get('websocketService');
    if (websocketService) {
      websocketService.notifyTaskUpdated(updatedTask, req.user);
    }

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to delete this task
    if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Store task info before deletion for WebSocket event
    const taskId = task.id;
    const departmentId = task.department_id;

    await task.destroy();

    // Emit WebSocket event for real-time updates
    const websocketService = req.app.get('websocketService');
    if (websocketService) {
      websocketService.notifyTaskDeleted(taskId, departmentId, req.user);
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};