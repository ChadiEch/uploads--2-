import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';

const ConnectionStatus = () => {
  const { connected, onlineUsers } = useWebSocket();

  return (
    <div className="flex items-center space-x-2 text-sm">
      {/* Connection indicator */}
      <div className="flex items-center space-x-1">
        <div
          className={`w-2 h-2 rounded-full ${
            connected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className={`text-xs ${
          connected ? 'text-green-600' : 'text-red-600'
        }`}>
          {connected ? 'Connected' : 'Disconnected'}
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
