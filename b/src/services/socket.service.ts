import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token as string, config.jwt.secret) as any;
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    const role = user?.role || 'unknown';
    const userId = user?.id || user?.sub;

    socket.join(`user:${userId}`);
    if (role === 'driver' && user?.driverId) socket.join(`driver:${user.driverId}`);
    if (role === 'student' && user?.studentId) socket.join(`student:${user.studentId}`);
    if (role === 'admin' || role === 'superadmin') socket.join('admin');

    socket.on('location:update', (data: { busId: string; lat: number; lng: number; speed?: number }) => {
      io.to('admin').emit('location:updated', { busId: data.busId, lat: data.lat, lng: data.lng, speed: data.speed, timestamp: new Date() });
    });

    socket.on('trip:start', (data: { tripId: string }) => {
      io.emit('trip:started', { tripId: data.tripId, timestamp: new Date() });
    });

    socket.on('trip:end', (data: { tripId: string }) => {
      io.emit('trip:ended', { tripId: data.tripId, timestamp: new Date() });
    });

    socket.on('attendance:checkin', (data: { tripId: string; studentId: string; studentName: string }) => {
      io.to('admin').emit('attendance:checkedin', data);
    });

    socket.on('notification:send', (data: { userId: string; title: string; body: string }) => {
      io.to(`user:${data.userId}`).emit('notification:received', data);
    });

    socket.on('disconnect', () => { });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function emitToUser(userId: string, event: string, data: any): void {
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToRole(role: string, event: string, data: any): void {
  io.to(role).emit(event, data);
}

export function emitToAll(event: string, data: any): void {
  io.emit(event, data);
}
