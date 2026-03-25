import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notes',
})
export class NotesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, Set<string>>();
  private socketUsers = new Map<
    string,
    { userId: string; name: string; avatar: string | null }
  >();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ─── ULANISH ────────────────────────────────
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, avatar: true },
      });
      if (!user) {
        client.disconnect();
        return;
      }

      this.socketUsers.set(client.id, {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
      });
      console.log(`✅ Connected: ${user.name}`);
    } catch {
      client.disconnect();
    }
  }

  // ─── UZILISH ────────────────────────────────
  handleDisconnect(client: Socket) {
    const user = this.socketUsers.get(client.id);
    if (!user) return;

    this.onlineUsers.forEach((users, noteId) => {
      if (users.has(user.userId)) {
        users.delete(user.userId);
        this.server
          .to(noteId)
          .emit('online-users', this.getOnlineUsers(noteId));
      }
    });

    this.socketUsers.delete(client.id);
    console.log(`❌ Disconnected: ${user.name}`);
  }

  // ─── NOTE GA QO'SHILISH ──────────────────────
  @SubscribeMessage('join-note')
  async handleJoinNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() noteId: string,
  ) {
    const user = this.socketUsers.get(client.id);
    if (!user) return;

    // Member ekanligini tekshirish
    const member = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId: user.userId, noteId } },
    });
    if (!member) {
      client.emit('error', "Ruxsat yo'q");
      return;
    }

    client.join(noteId);

    if (!this.onlineUsers.has(noteId)) this.onlineUsers.set(noteId, new Set());
    this.onlineUsers.get(noteId)!.add(user.userId);

    // Online userlarni xabar qilish
    this.server.to(noteId).emit('online-users', this.getOnlineUsers(noteId));
    console.log(`📝 ${user.name} joined note: ${noteId}`);
  }

  // ─── NOTE DAN CHIQISH ───────────────────────
  @SubscribeMessage('leave-note')
  handleLeaveNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() noteId: string,
  ) {
    const user = this.socketUsers.get(client.id);
    if (!user) return;

    client.leave(noteId);
    this.onlineUsers.get(noteId)?.delete(user.userId);
    this.server.to(noteId).emit('online-users', this.getOnlineUsers(noteId));
  }

  // ─── CONTENT O'ZGARTIRISH ───────────────────
  @SubscribeMessage('update-content')
  async handleUpdateContent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: string; content: string },
  ) {
    const user = this.socketUsers.get(client.id);
    if (!user) return;

    const member = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId: user.userId, noteId: data.noteId } },
    });
    if (!member || member.role === 'VIEWER') return;

    // Bazaga saqlash
    await this.prisma.note.update({
      where: { id: data.noteId },
      data: { content: data.content },
    });

    // ─── VERSION SAQLASH ──────────────────────
    await this.prisma.noteVersion.create({
      data: {
        noteId: data.noteId,
        content: data.content,
        savedBy: user.userId,
      },
    });

    // Oxirgi 5 tadan oshsa eskisini o'chirish
    const versions = await this.prisma.noteVersion.findMany({
      where: { noteId: data.noteId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (versions.length > 5) {
      const oldIds = versions.slice(5).map((v) => v.id);
      await this.prisma.noteVersion.deleteMany({
        where: { id: { in: oldIds } },
      });
    }

    // O'zidan boshqa hammaga yuborish
    client.to(data.noteId).emit('content-updated', {
      content: data.content,
      updatedBy: { id: user.userId, name: user.name },
    });
  }

  // ─── CURSOR POSITION ────────────────────────
  @SubscribeMessage('cursor-move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: string; position: number },
  ) {
    const user = this.socketUsers.get(client.id);
    if (!user) return;

    client.to(data.noteId).emit('cursor-moved', {
      userId: user.userId,
      name: user.name,
      position: data.position,
    });
  }

  // ─── YOZAYAPTI ──────────────────────────────
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() noteId: string,
  ) {
    const user = this.socketUsers.get(client.id);
    if (!user) return;

    client
      .to(noteId)
      .emit('user-typing', { userId: user.userId, name: user.name });
  }

  // ─── HELPER ─────────────────────────────────
  private getOnlineUsers(noteId: string) {
    return Array.from(this.onlineUsers.get(noteId) || []);
  }
}
