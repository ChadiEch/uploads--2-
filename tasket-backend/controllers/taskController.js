const { Task, Employee, Department, TaskComment } = require('../models');
const { Op } = require('sequelize');

// Helper function to delete old attachment files
const deleteOldAttachment = (oldAttachmentPath) => {
  try {
    // Only delete if the path is a local upload path and not an external URL
    if (oldAttachmentPath && typeof oldAttachmentPath === 'string' && oldAttachmentPath.startsWith('/uploads/')) {
      const fs = require('fs');
      const path = require('path');
      
      // Extract just the filename to prevent path traversal attacks
      const filename = path.basename(oldAttachmentPath);
      const fullPath = path.join(__dirname, '..', 'uploads', filename);
      
      // Additional safety check: ensure the file exists and is in the uploads directory
      if (fs.existsSync(fullPath) && fullPath.startsWith(path.resolve(__dirname, '..', 'uploads'))) {
        fs.unlinkSync(fullPath);
        console.log('Successfully deleted old attachment:', fullPath);
      } else {
        console.log('Skipped deletion - file not in uploads directory or does not exist:', fullPath);
      }
    } else {
      console.log('Skipped deletion - not a local upload path:', oldAttachmentPath);
    }
  } catch (error) {
    console.error('Error in deleteOldAttachment function:', error);
  }
};

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
    // Handle task data - either from body or parsed from form data
    let taskData = {};
    if (req.body.data) {
      // If data is sent as JSON string in form data
      try {
        taskData = JSON.parse(req.body.data);
      } catch (parseError) {
        console.error('Error parsing task data:', parseError);
        return res.status(400).json({ message: 'Invalid task data format' });
      }
    } else {
      // If data is sent as regular form fields
      taskData = req.body;
    }

    // Validate required fields
    const { title, estimated_hours } = taskData;
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const parsedEstimatedHours = estimated_hours ? parseFloat(estimated_hours) : null;
    if (parsedEstimatedHours === null || isNaN(parsedEstimatedHours) || parsedEstimatedHours < 0.01) {
      return res.status(400).json({ message: 'Estimated hours is required and must be at least 0.01' });
    }

    const {
      description,
      assigned_to,
      department_id,
      status,
      priority,
      due_date,
      tags,
      attachments // This will be handled separately
    } = taskData;

    // For admins, allow assignment to any employee or unassigned (null)
    // For non-admins, always assign to the current user
    let assignedToEmployee = req.user.id; // Default to current user
    if (req.user.role === 'admin') {
      // Admin can assign to any employee or leave it unassigned (null)
      assignedToEmployee = assigned_to !== undefined ? assigned_to : req.user.id;
    }

    // Process uploaded files
    let processedAttachments = Array.isArray(attachments) ? attachments : [];
    if (req.files && req.files.length > 0) {
      // Add uploaded files to attachments
      const uploadedFiles = req.files.map(file => ({
        id: Date.now() + Math.random(), // Generate a temporary ID
        type: file.mimetype.startsWith('image/') ? 'photo' : 'document',
        url: `/uploads/${file.filename}`,
        name: file.originalname
      }));
      
      // Filter out placeholder attachments (those with empty URLs)
      // This ensures we only keep valid attachments and replace placeholders with actual uploaded files
      const filteredAttachments = processedAttachments.filter(attachment => attachment && attachment.url);
      processedAttachments = [...filteredAttachments, ...uploadedFiles];
    }

    // Handle start_date for tasks created as in-progress
    let startDate = null;
    if (status === 'in-progress') {
      startDate = new Date();
    }
    
    // Handle completed_date for tasks created as completed
    let completedDate = null;
    let actualHours = null;
    if (status === 'completed') {
      completedDate = new Date();
      // If task is created as completed, we'll calculate actual hours as 0
      // since we don't have a start date
      actualHours = 0;
    }

    const finalTaskData = {
      title,
      description,
      assigned_to: assignedToEmployee,
      created_by: req.user.id,
      department_id,
      status: status || 'planned',
      priority: priority || 'medium',
      due_date,
      start_date: startDate, // Add start_date
      completed_date: completedDate, // Add completed_date
      actual_hours: actualHours, // Add actual_hours
      estimated_hours: parsedEstimatedHours,
      tags: Array.isArray(tags) ? tags : [],
      attachments: processedAttachments
    };

    const task = await Task.create(finalTaskData);

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
    const { id } = req.params;
    
    // Handle task data - either from body or parsed from form data
    let taskData = {};
    if (req.body.data) {
      // If data is sent as JSON string in form data
      try {
        taskData = JSON.parse(req.body.data);
      } catch (parseError) {
        console.error('Error parsing task data:', parseError);
        return res.status(400).json({ message: 'Invalid task data format' });
      }
    } else {
      // If data is sent as regular form fields
      taskData = req.body;
    }

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

    // Prepare update data
    const updateData = {};
    
    // Only include fields that are actually provided in the request
    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description;
    if (taskData.assigned_to !== undefined) {
      // Only admins can change assignment
      if (req.user.role === 'admin') {
        updateData.assigned_to = taskData.assigned_to;
      } else {
        // Non-admins cannot change assignment
        updateData.assigned_to = task.assigned_to;
      }
    }
    if (taskData.department_id !== undefined) updateData.department_id = taskData.department_id;
    if (taskData.status !== undefined) updateData.status = taskData.status;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;
    if (taskData.due_date !== undefined) updateData.due_date = taskData.due_date;
    if (taskData.estimated_hours !== undefined) {
      const parsedEstimatedHours = parseFloat(taskData.estimated_hours);
      if (!isNaN(parsedEstimatedHours) && parsedEstimatedHours >= 0.01) {
        // Ensure we preserve decimal precision without rounding
        updateData.estimated_hours = parsedEstimatedHours;
      } else if (parsedEstimatedHours === 0) {
        updateData.estimated_hours = 0.00;
      }
    }
    
    // Automatically set start_date when task status changes to 'in-progress'
    if (taskData.status === 'in-progress' && task.status !== 'in-progress') {
      // Only set start_date if it's not already set
      if (!task.start_date) {
        updateData.start_date = new Date();
      }
    }
    
    // Automatically calculate actual hours when task is completed
    if (taskData.status === 'completed' && task.status !== 'completed') {
      // Only calculate if start_date exists
      if (task.start_date) {
        const startDate = new Date(task.start_date);
        const completedDate = new Date();
        const diffInHours = (completedDate - startDate) / (1000 * 60 * 60); // Calculate in hours with decimals
        updateData.actual_hours = parseFloat(diffInHours.toFixed(2)); // Ensure 2 decimal places
        updateData.completed_date = completedDate;
      } else {
        // If no start date, use a default calculation or set to 0
        updateData.actual_hours = 0.00;
        updateData.completed_date = new Date();
      }
    } else if (taskData.status !== 'completed' && task.status === 'completed') {
      // If task is being changed from completed to another status, clear actual_hours and completed_date
      updateData.actual_hours = null;
      updateData.completed_date = null;
    }
    
    if (taskData.tags !== undefined) updateData.tags = Array.isArray(taskData.tags) ? taskData.tags : [];
    
    // Process uploaded files for attachments
    let processedAttachments = taskData.attachments;
    if (req.files && req.files.length > 0) {
      // Add uploaded files to attachments
      const uploadedFiles = req.files.map(file => ({
        id: Date.now() + Math.random(), // Generate a temporary ID
        type: file.mimetype.startsWith('image/') ? 'photo' : 'document',
        url: `/uploads/${file.filename}`,
        name: file.originalname
      }));
      
      // If we're updating and have existing attachments, filter out any placeholder attachments
      // that were added for file uploads (they have empty URLs)
      if (processedAttachments && Array.isArray(processedAttachments)) {
        // Filter out placeholder attachments (those with empty URLs that were meant to be replaced)
        const filteredAttachments = processedAttachments.filter(attachment => attachment && attachment.url);
        processedAttachments = [...filteredAttachments, ...uploadedFiles];
      } else {
        processedAttachments = uploadedFiles;
      }
    }
    
    // Update attachments if provided
    if (processedAttachments !== undefined) {
      // Ensure we only store valid attachments with URLs
      updateData.attachments = Array.isArray(processedAttachments) ? 
        processedAttachments.filter(att => att && att.url) : [];
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

    await task.destroy();

    // Emit WebSocket event for real-time updates
    const websocketService = req.app.get('websocketService');
    if (websocketService) {
      websocketService.notifyTaskDeleted(id, task.department_id, req.user);
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