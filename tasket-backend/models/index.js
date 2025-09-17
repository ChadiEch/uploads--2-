const sequelize = require('../config/database');
const Department = require('./Department');
const Employee = require('./Employee');
const Task = require('./Task');
const TaskComment = require('./TaskComment');
const Project = require('./Project');

// Define associations
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Manager relationship
Department.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });
Employee.hasOne(Department, { foreignKey: 'manager_id', as: 'managedDepartment' });

Employee.hasMany(Task, { foreignKey: 'assigned_to', as: 'assignedTasks' });
Employee.hasMany(Task, { foreignKey: 'created_by', as: 'createdTasks' });
Task.belongsTo(Employee, { foreignKey: 'assigned_to', as: 'assignedToEmployee' });
Task.belongsTo(Employee, { foreignKey: 'created_by', as: 'createdByEmployee' });

Department.hasMany(Task, { foreignKey: 'department_id', as: 'tasks' });
Task.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

Task.hasMany(TaskComment, { foreignKey: 'task_id', as: 'comments' });
TaskComment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

Employee.hasMany(TaskComment, { foreignKey: 'employee_id', as: 'comments' });
TaskComment.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Project associations
Employee.hasMany(Project, { foreignKey: 'created_by', as: 'createdProjects' });
Project.belongsTo(Employee, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
  sequelize,
  Department,
  Employee,
  Task,
  TaskComment,
  Project
};