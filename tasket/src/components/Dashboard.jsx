import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useWebSocket } from '../context/WebSocketContext';
import StatsCard from './StatsCard';
import RealTimeTaskList from './RealTimeTaskList';
import { BarChart } from './charts/BarChart';
import { PieChart } from './charts/PieChart';
import { LineChart } from './charts/LineChart';
import { sampleData, taskStatus, departmentEmployees } from '../data/mockData';

const Dashboard = () => {
  const { departments, employees, tasks } = useApp();
  const { connected, onlineUsers, subscribeToTaskUpdates } = useWebSocket();
  const [realtimeStats, setRealtimeStats] = useState(null);
  
  // Subscribe to real-time task updates for live dashboard updates
  useEffect(() => {
    if (connected && subscribeToTaskUpdates) {
      const unsubscribe = subscribeToTaskUpdates((eventData) => {
        // Update realtime stats when tasks change
        setRealtimeStats({
          lastUpdate: new Date().toLocaleTimeString(),
          event: eventData.type === 'deleted' ? 'Task Deleted' : 'Task Updated',
          updatedBy: eventData.updatedBy?.name || eventData.deletedBy?.name || 'Unknown'
        });
      });

      return unsubscribe;
    }
  }, [connected, subscribeToTaskUpdates]);
  
  // Calculate task statistics
  const taskStats = {
    planned: tasks.filter(task => task.status === 'planned').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    completed: tasks.filter(task => task.status === 'completed').length,
    total: tasks.length
  };
  
  // Calculate high priority tasks
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' || task.priority === 'urgent').length;
  
  // Calculate tasks due this week
  const today = new Date();
  const oneWeek = new Date(today);
  oneWeek.setDate(today.getDate() + 7);
  
  const dueSoonTasks = tasks.filter(task => {
    const dueDate = new Date(task.date);
    return dueDate >= today && dueDate <= oneWeek;
  }).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-sm text-gray-500">
              Welcome back, Admin User
            </span>
            {connected && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live Updates</span>
                {onlineUsers.length > 0 && (
                  <span className="text-xs text-gray-500">
                    ({onlineUsers.length} users online)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {realtimeStats && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-600 font-medium">
              Last Update: {realtimeStats.lastUpdate}
            </div>
            <div className="text-sm text-blue-800">
              {realtimeStats.event} by {realtimeStats.updatedBy}
            </div>
          </div>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Departments"
          value={departments.length}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="indigo"
        />
        <StatsCard
          title="Employees"
          value={employees.length}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="blue"
        />
        <StatsCard
          title="Total Tasks"
          value={taskStats.total}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
          color="green"
        />
        <StatsCard
          title="Due This Week"
          value={dueSoonTasks}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="amber"
        />
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Task Status</h2>
          <PieChart data={[
            { name: 'Planned', value: taskStats.planned, color: '#3B82F6' },
            { name: 'In Progress', value: taskStats.inProgress, color: '#F59E0B' },
            { name: 'Completed', value: taskStats.completed, color: '#10B981' }
          ]} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Department Employee Count</h2>
          <BarChart data={departments.map(dept => ({
            name: dept.name,
            value: dept.employeeCount
          }))} />
        </div>
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Task Completion Trend</h2>
          <LineChart data={sampleData} />
        </div>
        
        {/* Real-time Task List */}
        <RealTimeTaskList limit={8} />
      </div>
      
      {/* Task Summary */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Task Summary</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-500 text-lg font-bold">{taskStats.planned}</div>
                <div className="text-blue-800">Planned</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg">
                <div className="text-amber-500 text-lg font-bold">{taskStats.inProgress}</div>
                <div className="text-amber-800">In Progress</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <div className="text-green-500 text-lg font-bold">{taskStats.completed}</div>
                <div className="text-green-800">Completed</div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">High Priority Tasks</h3>
                <span className="text-xs text-gray-500">{highPriorityTasks} of {taskStats.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${(highPriorityTasks / taskStats.total) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Completion Rate</h3>
                <span className="text-xs text-gray-500">{taskStats.completed} of {taskStats.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${(taskStats.completed / taskStats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
