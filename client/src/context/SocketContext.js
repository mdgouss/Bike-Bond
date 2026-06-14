import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      newSocket.on('userOnline', (data) => {
        setOnlineUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
      });

      newSocket.on('userOffline', (data) => {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      setSocket(prevSocket => {
        if (prevSocket) prevSocket.close();
        return null;
      });
    }
  }, [isAuthenticated, token]);

  // Private messaging
  const sendPrivateMessage = (receiverId, content, messageType = 'text') => {
    if (socket) {
      socket.emit('sendPrivateMessage', { receiverId, content, messageType });
    }
  };

  // Group chat
  const joinGroupChat = (chatId) => {
    if (socket) {
      socket.emit('joinGroupChat', chatId);
    }
  };

  const leaveGroupChat = (chatId) => {
    if (socket) {
      socket.emit('leaveGroupChat', chatId);
    }
  };

  const sendGroupMessage = (chatId, content, messageType = 'text') => {
    if (socket) {
      socket.emit('sendGroupMessage', { chatId, content, messageType });
    }
  };

  // Typing indicators
  const startTyping = (chatId, isGroup = false) => {
    if (socket) {
      socket.emit('typing', { chatId, isGroup });
    }
  };

  const stopTyping = (chatId, isGroup = false) => {
    if (socket) {
      socket.emit('stopTyping', { chatId, isGroup });
    }
  };

  // Live location tracking
  const joinRideTracking = (rideId) => {
    if (socket) {
      socket.emit('joinRideTracking', rideId);
    }
  };

  const leaveRideTracking = (rideId) => {
    if (socket) {
      socket.emit('leaveRideTracking', rideId);
    }
  };

  const updateLocation = (rideId, locationData) => {
    if (socket) {
      socket.emit('updateLocation', { rideId, ...locationData });
    }
  };

  const stopLocationSharing = (rideId) => {
    if (socket) {
      socket.emit('stopLocationSharing', rideId);
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    sendPrivateMessage,
    joinGroupChat,
    leaveGroupChat,
    sendGroupMessage,
    startTyping,
    stopTyping,
    joinRideTracking,
    leaveRideTracking,
    updateLocation,
    stopLocationSharing
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
