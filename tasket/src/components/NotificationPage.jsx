import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useApp } from '../context/AppContext';
import { notificationsAPI } from '../lib/api';

const NotificationPage = () => {
  const { notifications, markNotificationAsRead, markAllAsRead, addNotification } = useWebSocket();
  const { navigateTo } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [initialNotificationsLoaded, setInitialNotificationsLoaded] = useState(false);

  // Load notifications when component mounts
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await notificationsAPI.getNotifications();
        console.log('Loaded notifications:', response);
        // Add API notifications to the WebSocket context
        if (response.notifications) {
          response.notifications.forEach(notification => {
            // Check if notification already exists to prevent duplicates
            if (!notifications.some(existing => existing.id === notification.id)) {
              // Transform backend notification format to frontend format
              const transformedNotification = {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                priority: notification.priority,
                read: notification.is_read,
                timestamp: notification.created_at,
                ...notification
              };
              addNotification(transformedNotification);
            }
          });
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setInitialNotificationsLoaded(true);
      }
    };

    if (!initialNotificationsLoaded) {
      loadNotifications();
    }
  }, [initialNotificationsLoaded, addNotification, notifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationsAPI.markAllAsRead();
      markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    // Handle notification click based on type
    if (notification.type === 'task_assigned' && notification.data) {
      // Navigate to calendar view
      navigateTo('calendar');
      // Use the global function to open the specific task
      setTimeout(() => {
        if (window.openTaskFromNotification) {
          window.openTaskFromNotification(notification.data.id);
        } else {
          console.warn('openTaskFromNotification function not available');
        }
      }, 300); // Increased delay to ensure navigation completes first
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'low': return 'border-l-gray-300 bg-gray-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-500">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''} ({unreadCount} unread)
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-md ${
                    filter === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-2 text-sm font-medium ${
                    filter === 'unread' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-t border-b border-gray-300'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-md ${
                    filter === 'read' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Read
                </button>
              </div>
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading || unreadCount === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? 'Marking...' : 'Mark all as read'}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 
               'No notifications'}
            </h3>
            <p className="mt-1 text-gray-500">
              {filter === 'unread' ? 'You\'re all caught up! Check back later for new notifications.' : 
               filter === 'read' ? 'You haven\'t read any notifications yet.' : 
               'You\'re all caught up! Check back later for new notifications.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`${getPriorityColor(notification.priority || 'medium')} border-l-4 cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {notification.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        notification.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {notification.priority}
                      </span>
                      <p className="ml-2 text-xs text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the main click handler
                          handleMarkAsRead(notification.id);
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;