import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext({});

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Event listeners
  const [taskUpdateListeners, setTaskUpdateListeners] = useState(new Set());
  const [taskCommentListeners, setTaskCommentListeners] = useState(new Set());
  const [userPresenceListeners, setUserPresenceListeners] = useState(new Set());
  const [notificationListeners, setNotificationListeners] = useState(new Set());

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(import.meta.env.VITE_WS_BASE_URL || 
        (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000'), {
        autoConnect: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      setSocket(newSocket);

      // Connection events
      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        setConnected(true);
        
        // Authenticate with the server
        const token = localStorage.getItem('authToken');
        if (token) {
          newSocket.emit('authenticate', token);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnected(false);
      });

      // Authentication events
      newSocket.on('authenticated', (data) => {
        console.log('WebSocket authenticated:', data.user);
        
        // Join user to their department room
        if (user.department_id) {
          newSocket.emit('join_room', `department_${user.department_id}`);
        }
        
        // Mark user as online
        newSocket.emit('user_online');
      });

      newSocket.on('auth_error', (error) => {
        console.error('WebSocket authentication error:', error);
      });

      // Task events
      newSocket.on('task_updated', (data) => {
        console.log('Task updated:', data);
        taskUpdateListeners.forEach(listener => listener(data));
      });

      newSocket.on('task_deleted', (data) => {
        console.log('Task deleted:', data);
        taskUpdateListeners.forEach(listener => listener({ ...data, type: 'deleted' }));
      });

      newSocket.on('task_assigned', (data) => {
        console.log('Task assigned:', data);
        addNotification({
          id: Date.now(),
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned task: ${data.task.title}`,
          data: data.task,
          timestamp: new Date().toISOString()
        });
      });

      newSocket.on('task_comment_added', (data) => {
        console.log('Task comment added:', data);
        taskCommentListeners.forEach(listener => listener(data));
      });

      // User presence events
      newSocket.on('user_presence', (data) => {
        console.log('User presence update:', data);
        userPresenceListeners.forEach(listener => listener(data));
        
        setOnlineUsers(prev => {
          if (data.status === 'online') {
            return [...prev.filter(u => u.userId !== data.userId), {
              userId: data.userId,
              userName: data.userName,
              timestamp: data.timestamp
            }];
          } else {
            return prev.filter(u => u.userId !== data.userId);
          }
        });
      });

      // Typing events
      newSocket.on('user_typing', (data) => {
        console.log('User typing:', data);
      });

      newSocket.on('user_stopped_typing', (data) => {
        console.log('User stopped typing:', data);
      });

      // Notification events
      newSocket.on('notification', (data) => {
        console.log('Notification received:', data);
        addNotification({
          id: Date.now(),
          ...data.notification,
          timestamp: data.timestamp
        });
      });

      // Connect the socket
      newSocket.connect();

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  // Helper functions
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications
    notificationListeners.forEach(listener => listener(notification));
  }, [notificationListeners]);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // Event subscription functions
  const subscribeToTaskUpdates = useCallback((callback) => {
    taskUpdateListeners.add(callback);
    return () => taskUpdateListeners.delete(callback);
  }, [taskUpdateListeners]);

  const subscribeToTaskComments = useCallback((callback) => {
    taskCommentListeners.add(callback);
    return () => taskCommentListeners.delete(callback);
  }, [taskCommentListeners]);

  const subscribeToUserPresence = useCallback((callback) => {
    userPresenceListeners.add(callback);
    return () => userPresenceListeners.delete(callback);
  }, [userPresenceListeners]);

  const subscribeToNotifications = useCallback((callback) => {
    notificationListeners.add(callback);
    return () => notificationListeners.delete(callback);
  }, [notificationListeners]);

  // Socket emit functions
  const joinRoom = useCallback((room) => {
    if (socket && connected) {
      socket.emit('join_room', room);
    }
  }, [socket, connected]);

  const leaveRoom = useCallback((room) => {
    if (socket && connected) {
      socket.emit('leave_room', room);
    }
  }, [socket, connected]);

  const emitTaskUpdate = useCallback((taskData) => {
    if (socket && connected) {
      socket.emit('task_update', taskData);
    }
  }, [socket, connected]);

  const emitTaskComment = useCallback((commentData) => {
    if (socket && connected) {
      socket.emit('task_comment', commentData);
    }
  }, [socket, connected]);

  const emitTypingStart = useCallback((taskId) => {
    if (socket && connected) {
      socket.emit('typing_start', { taskId });
    }
  }, [socket, connected]);

  const emitTypingStop = useCallback((taskId) => {
    if (socket && connected) {
      socket.emit('typing_stop', { taskId });
    }
  }, [socket, connected]);

  const value = {
    socket,
    connected,
    onlineUsers,
    notifications,
    unreadNotifications: notifications.filter(n => !n.read),
    
    // Event subscriptions
    subscribeToTaskUpdates,
    subscribeToTaskComments,
    subscribeToUserPresence,
    subscribeToNotifications,
    
    // Actions
    joinRoom,
    leaveRoom,
    emitTaskUpdate,
    emitTaskComment,
    emitTypingStart,
    emitTypingStop,
    
    // Notification management
    addNotification,
    removeNotification,
    markNotificationAsRead,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
