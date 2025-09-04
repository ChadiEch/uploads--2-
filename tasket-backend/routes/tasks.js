const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks (filtered by user role)
// @access  Private
router.get('/', auth, getTasks);

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', auth, getTask);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('assigned_to').isUUID(),
  body('department_id').optional().isUUID(),
  body('status').optional().isIn(['planned', 'in-progress', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('due_date').optional().isISO8601(),
  body('start_date').optional().isISO8601(),
  body('estimated_hours').optional().isInt({ min: 1 }),
  body('tags').optional().isArray()
], createTask);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('assigned_to').optional().isUUID(),
  body('department_id').optional().isUUID(),
  body('status').optional().isIn(['planned', 'in-progress', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('due_date').optional().isISO8601(),
  body('start_date').optional().isISO8601(),
  body('estimated_hours').optional().isInt({ min: 1 }),
  body('actual_hours').optional().isInt({ min: 1 }),
  body('tags').optional().isArray()
], updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, deleteTask);

module.exports = router;