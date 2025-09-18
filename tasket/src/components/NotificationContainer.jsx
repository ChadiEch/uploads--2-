import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useApp } from '../context/AppContext';

const NotificationToast = ({ notification, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'task_updated':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'task_comment':
        return (
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'task_assigned':
        return 'bg-blue-50 border-blue-200';
      case 'task_updated':
        return 'bg-green-50 border-green-200';
      case 'task_comment':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div
      className={`transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden cursor-pointer`}
      onClick={() => onAction && onAction(notification)}
    >
      <div className={`p-4 border-l-4 ${getBgColor(notification.type)}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {notification.message}
            </p>
            {notification.data && (
              <div className="mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the main click handler
                    onAction && onAction(notification);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  View Task
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the main click handler
                handleClose();
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification, markNotificationAsRead } = useWebSocket();
  const { navigateTo } = useApp();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    // Only show unread notifications as toasts
    const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3); // Max 3 toasts
    setVisibleNotifications(unreadNotifications);
  }, [notifications]);

  const handleClose = (notificationId) => {
    markNotificationAsRead(notificationId);
    setVisibleNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleAction = (notification) => {
    // Handle notification action based on type
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
    handleClose(notification.id);
  };

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {visibleNotifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => handleClose(notification.id)}
            onAction={handleAction}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;