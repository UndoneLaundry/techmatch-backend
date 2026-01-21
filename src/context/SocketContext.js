import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Only connect socket if user exists AND is ACTIVE
    if (!user || user.status !== 'ACTIVE') {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return;

    const newSocket = io(
      process.env.REACT_APP_API_URL || 'http://localhost:4000',
      {
        auth: { token: accessToken },
        transports: ['websocket'],
      }
    );

    setSocket(newSocket);

    // ===== User events =====
    newSocket.on('verification:statusChanged', async (data) => {
      setNotifications((prev) => [
        ...prev,
        { type: 'verification', data, timestamp: new Date() },
      ]);

      if (data.status === 'ACTIVE') {
        await refreshUser();
      }
    });

    newSocket.on('skill:statusChanged', (data) => {
      setNotifications((prev) => [
        ...prev,
        { type: 'skill', data, timestamp: new Date() },
      ]);
    });

    // ===== Admin-only events =====
    if (user.role === 'ADMIN') {
      newSocket.on('admin:newVerification', (data) => {
        setNotifications((prev) => [
          ...prev,
          { type: 'admin:verification', data, timestamp: new Date() },
        ]);
      });

      newSocket.on('admin:newSkillSubmission', (data) => {
        setNotifications((prev) => [
          ...prev,
          { type: 'admin:skill', data, timestamp: new Date() },
        ]);
      });
    }

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user, refreshUser]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        clearNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
