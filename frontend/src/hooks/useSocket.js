import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAppContext } from '../context/AppContext';

export const useSocket = () => {
  const { setAlerts, setSocketConnected } = useAppContext();

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('alert', (alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [setAlerts, setSocketConnected]);
};
