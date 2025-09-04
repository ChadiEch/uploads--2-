import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useWebSocket } from '../context/WebSocketContext';

const RealTimeTaskList = ({ limit = 10 }) => {
  const { tasks, updateTask } = useApp();
  const { connected, subscribeToTaskUpdates, joinRoom, leaveRoom } = useWebSocket();
  const [recentlyUpdated, setRecentlyUpdated] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());

  // Subscribe to real-time updates
  useEffect(() => {
    if (connected && subscribeToTaskUpdates) {
      const unsubscribe = subscribeToTaskUpdates((eventData) => {
        // Highlight recently updated tasks
        if (eventData.task && eventData.task.id) {
          setRecentlyUpdated(prev => new Set([...prev, eventData.task.id]));
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setRecentlyUpdated(prev => {
              const newSet = new Set(prev);
              newSet.delete(eventData.task.id);
              return newSet;
            });
          }, 3000);
        }
      });

      return unsubscribe;
    }
  }, [connected, subscribeToTaskUpdates]);

  // Join task rooms for real-time collaboration
  useEffect(() => {
    if (connected) {
      tasks.slice(0, limit).forEach(task => {
        joinRoom(`task_${task.id}`);
      });

      return () => {
        tasks.slice(0, limit).forEach(task => {
          leaveRoom(`task_${task.id}`);
        });
      };
    }
  }, [connected, tasks, limit, joinRoom, leaveRoom]);

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const recentTasks = tasks.slice(0, limit);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
          <div className="flex items-center space-x-2">
            {connected && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
            <span className="text-sm text-gray-500">
              {recentTasks.length} tasks
            </span>
          </div>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {recentTasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="mt-2">No tasks yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                  recentlyUpdated.has(task.id) ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </h4>
                      {recentlyUpdated.has(task.id) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Updated
                        </span>
                      )}
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {task.description}
                    </p>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{task.assignedToEmployee?.name || 'Unassigned'}</span>
                      </div>
                      
                      {task.due_date && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        getStatusColor(task.status)
                      }`}>
                        {task.status}
                      </span>
                      
                      <span className={`text-xs font-medium ${
                        getPriorityColor(task.priority)
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                {typingUsers.has(task.id) && (
                  <div className="mt-2 text-xs text-gray-500 italic">
                    {Array.from(typingUsers.get(task.id) || []).join(', ')} typing...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {recentTasks.length >= limit && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            View All Tasks
          </button>
        </div>
      )}
    </div>
  );
};

export default RealTimeTaskList;
