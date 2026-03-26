import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { PrismaService } from '../../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { OnEvent } from '@nestjs/event-emitter'
import { COMMENT_EVENTS } from '../comments/comment.events'
import type {
  CommentCreatedPayload,
  CommentUpdatedPayload,
  CommentResolvedPayload,
  CommentDeletedPayload,
} from '../comments/comment.events'

interface SocketUserData {
  userId: string
  name: string
  avatar: string | null
  noteIds: Set<string>
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notes',
})
export class NotesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private noteUsers = new Map<string, Map<string, Set<string>>>()
  private socketUsers = new Map<string, SocketUserData>()
  private saveTimers = new Map<string, NodeJS.Timeout>()

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ─── ULANISH ──────────────────────────────────────────────────────────────

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1]

      if (!token) {
        console.log('❌ Token yo\'q, disconnect')
        return client.disconnect()
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      })

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, avatar: true },
      })

      if (!user) {
        console.log('❌ User topilmadi, disconnect')
        return client.disconnect()
      }

      this.socketUsers.set(client.id, {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        noteIds: new Set(),
      })

      console.log(`✅ Connected: ${user.name} (${client.id})`)
    } catch (err) {
      console.error('handleConnection error:', err)
      client.disconnect()
    }
  }

  // ─── UZILISH ──────────────────────────────────────────────────────────────

  handleDisconnect(client: Socket) {
    const userData = this.socketUsers.get(client.id)
    if (!userData) return

    for (const noteId of userData.noteIds) {
      this.removeSocketFromNote(client.id, userData.userId, noteId)
      this.broadcastOnlineUsers(noteId)
    }

    this.socketUsers.delete(client.id)
    console.log(`❌ Disconnected: ${userData.name} (${client.id})`)
  }

  // ─── NOTE GA QO'SHILISH ───────────────────────────────────────────────────

  @SubscribeMessage('join-note')
  async handleJoinNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() noteId: string,
  ) {
    const userData = this.socketUsers.get(client.id)

    // ✅ userData yo'q — handleConnection hali tugamagan bo'lishi mumkin
    if (!userData) {
      console.log(`⚠️ join-note: userData topilmadi (${client.id}), qayta urinish...`)
      // Kichik delay bilan qayta urinish
      setTimeout(() => this.handleJoinNote(client, noteId), 300)
      return
    }

    console.log(`join-note: userId=${userData.userId}, noteId=${noteId}`)

    // ✅ noteMember tekshirish
    const member = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId: userData.userId, noteId } },
    })

    console.log(`noteMember:`, member)

    if (!member) {
      console.log(`⚠️ ${userData.name} note ${noteId} ga a'zo emas`)
      client.emit('error', "Ruxsat yo'q")
      return
    }

    client.join(noteId)
    userData.noteIds.add(noteId)

    if (!this.noteUsers.has(noteId)) {
      this.noteUsers.set(noteId, new Map())
    }
    const usersInNote = this.noteUsers.get(noteId)!
    if (!usersInNote.has(userData.userId)) {
      usersInNote.set(userData.userId, new Set())
    }
    usersInNote.get(userData.userId)!.add(client.id)

    this.broadcastOnlineUsers(noteId)
    console.log(`📝 ${userData.name} joined note: ${noteId}`)
  }

  // ─── NOTE DAN CHIQISH ─────────────────────────────────────────────────────

  @SubscribeMessage('leave-note')
  handleLeaveNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() noteId: string,
  ) {
    const userData = this.socketUsers.get(client.id)
    if (!userData) return

    client.leave(noteId)
    userData.noteIds.delete(noteId)
    this.removeSocketFromNote(client.id, userData.userId, noteId)
    this.broadcastOnlineUsers(noteId)
  }

  // ─── CONTENT O'ZGARTIRISH ─────────────────────────────────────────────────

  @SubscribeMessage('update-content')
  async handleUpdateContent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: string; content: string },
  ) {
    const userData = this.socketUsers.get(client.id)
    if (!userData) return

    const member = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId: userData.userId, noteId: data.noteId } },
    })
    if (!member || member.role === 'VIEWER') return

    // Real-time — darhol boshqalarga yuboramiz
    client.to(data.noteId).emit('content-updated', {
      content: data.content,
      updatedBy: { id: userData.userId, name: userData.name },
    })

    // DB ga debounce bilan saqlaymiz
    this.scheduleSave(data.noteId, data.content, userData.userId)
  }

  // ─── TYPING ───────────────────────────────────────────────────────────────

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() noteId: string,
  ) {
    const userData = this.socketUsers.get(client.id)
    if (!userData) return

    client.to(noteId).emit('user-typing', {
      userId: userData.userId,
      name: userData.name,
    })
  }

  // ─── CURSOR ───────────────────────────────────────────────────────────────

  @SubscribeMessage('cursor-move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: string; position: number },
  ) {
    const userData = this.socketUsers.get(client.id)
    if (!userData) return

    client.to(data.noteId).emit('cursor-moved', {
      userId: userData.userId,
      name: userData.name,
      position: data.position,
    })
  }

  // ─── COMMENT EVENTS ───────────────────────────────────────────────────────

  @OnEvent(COMMENT_EVENTS.CREATED)
  handleCommentCreated({ noteId, comment }: CommentCreatedPayload) {
    this.server.to(noteId).emit('comment:created', comment)
  }

  @OnEvent(COMMENT_EVENTS.UPDATED)
  handleCommentUpdated({ noteId, comment }: CommentUpdatedPayload) {
    this.server.to(noteId).emit('comment:updated', comment)
  }

  @OnEvent(COMMENT_EVENTS.RESOLVED)
  handleCommentResolved({ noteId, id, resolved }: CommentResolvedPayload) {
    this.server.to(noteId).emit('comment:resolved', { id, resolved })
  }

  @OnEvent(COMMENT_EVENTS.DELETED)
  handleCommentDeleted({ noteId, id }: CommentDeletedPayload) {
    this.server.to(noteId).emit('comment:deleted', { id })
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private async broadcastOnlineUsers(noteId: string) {
  const usersInNote = this.noteUsers.get(noteId)
  if (!usersInNote) {
    this.server.to(noteId).emit('online-users', [])
    return
  }

  const onlineList = await Promise.all(
    Array.from(usersInNote.keys()).map(async (userId) => {
      const socketId = Array.from(usersInNote.get(userId)!)[0]
      const userData = this.socketUsers.get(socketId)

      // ← role ni DB dan olamiz
      const member = await this.prisma.noteMember.findUnique({
        where: { userId_noteId: { userId, noteId } },
        select: { role: true },
      })

      return {
        userId,
        name: userData?.name ?? userId,
        avatar: userData?.avatar ?? null,
        role: member?.role ?? 'VIEWER', // ← qo'shildi
      }
    })
  )

  console.log(`📡 online-users broadcast (${noteId}):`, onlineList)
  this.server.to(noteId).emit('online-users', onlineList)
}

  private removeSocketFromNote(socketId: string, userId: string, noteId: string) {
    const usersInNote = this.noteUsers.get(noteId)
    if (!usersInNote) return

    const sockets = usersInNote.get(userId)
    if (sockets) {
      sockets.delete(socketId)
      if (sockets.size === 0) {
        usersInNote.delete(userId)
      }
    }

    if (usersInNote.size === 0) {
      this.noteUsers.delete(noteId)
    }
  }

  private scheduleSave(noteId: string, content: string, userId: string) {
    const existing = this.saveTimers.get(noteId)
    if (existing) clearTimeout(existing)

    const timer = setTimeout(async () => {
      this.saveTimers.delete(noteId)
      await this.persistContent(noteId, content, userId)
    }, 2000)

    this.saveTimers.set(noteId, timer)
  }

  private async persistContent(noteId: string, content: string, userId: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.note.update({
          where: { id: noteId },
          data: { content },
        })

        await tx.noteVersion.create({
          data: { noteId, content, savedBy: userId },
        })

        const oldVersions = await tx.noteVersion.findMany({
          where: { noteId },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
          skip: 5,
        })

        if (oldVersions.length > 0) {
          await tx.noteVersion.deleteMany({
            where: { id: { in: oldVersions.map(v => v.id) } },
          })
        }
      })
    } catch (err) {
      console.error(`persistContent error (noteId: ${noteId}):`, err)
    }
  }
}