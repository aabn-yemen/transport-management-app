import { io, Socket } from 'socket.io-client';
import { config } from '../constants/config';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(config.socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
  socket.on('connect_error', (err) => console.error('Socket connection error:', err.message));

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function emitLocation(data: { busId: string; lat: number; lng: number; speed?: number }): void {
  socket?.emit('location:update', data);
}

export function emitTripStart(tripId: string): void {
  socket?.emit('trip:start', { tripId });
}

export function emitTripEnd(tripId: string): void {
  socket?.emit('trip:end', { tripId });
}

export function emitCheckin(data: { tripId: string; studentId: string; studentName: string }): void {
  socket?.emit('attendance:checkin', data);
}
