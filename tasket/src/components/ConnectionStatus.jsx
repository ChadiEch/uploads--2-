import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';

const ConnectionStatus = () => {
  const { connected, onlineUsers, socket } = useWebSocket();

  // Determine connection status message
  const getConnectionStatus = () => {
    // If there's no socket instance, we're disconnected
    if (!socket) {
      return { text: 'Disconnected', color: 'red' };
    }
    
    // If we're connected, show connected status
    if (connected && socket.connected) {
      return { text: 'Connected', color: 'green' };
    }
    
    // If socket exists but we're not connected, we might be connecting or disconnected
    // Check socket's actual connection state
    if (socket.connected) {
      return { text: 'Connected', color: 'green' };
    }
    
    // If we're in the process of connecting
    if (socket.disconnected === false && socket.connected === false) {
      return { text: 'Connecting...', color: 'yellow' };
    }
    
    // If socket is disconnected
    if (socket.disconnected) {
      return { text: 'Disconnected', color: 'red' };
    }
    
    // Default to disconnected
    return { text: 'Disconnected', color: 'red' };
  };

  const status = getConnectionStatus();

  return (
    <div className="flex items-center space-x-2 text-sm">
      {/* Connection indicator */}
      <div className="flex items-center space-x-1">
        <div
          className={`w-2 h-2 rounded-full bg-${status.color}-500`}
        />
        <span className={`text-xs text-${status.color}-600`}>
          {status.text}
        </span>
      </div>

      {/* Online users count */}
      {connected && onlineUsers.length > 0 && (
        <div className="flex items-center space-x-1 text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" 
            />
          </svg>
          <span className="text-xs">
            {onlineUsers.length} online
          </span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;