import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Khởi tạo socket connection
    socketRef.current = io('http://localhost:4000', {
      transports: ['websocket'],
      autoConnect: true
    });

    // Cleanup khi component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
}; 