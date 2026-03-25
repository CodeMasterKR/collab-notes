import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateNoteDto } from './dto/create-note.dto'
import { UpdateNoteDto } from './dto/update-note.dto'

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE ─────────────────────────────────
  async create(userId: string, dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        title: dto.title,
        content: dto.content ?? '',
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: { members: true },
    })
  }

  // ─── GET ALL (faqat o'zining notelari) ──────
  async findAll(userId: string) {
    return this.prisma.note.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  // ─── GET ONE ────────────────────────────────
  async findOne(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        comments: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      },
    })

    if (!note) throw new NotFoundException('Note topilmadi')

    const isMember = note.members.some(m => m.userId === userId)
    if (!isMember) throw new ForbiddenException('Ruxsat yo\'q')

    return note
  }

  // ─── UPDATE ─────────────────────────────────
  async update(userId: string, noteId: string, dto: UpdateNoteDto) {
    const member = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId, noteId } },
    })

    if (!member) throw new NotFoundException('Note topilmadi')
    if (member.role === 'VIEWER') throw new ForbiddenException('VIEWER tahrirlay olmaydi')

    return this.prisma.note.update({
      where: { id: noteId },
      data: dto,
    })
  }

  // ─── DELETE ─────────────────────────────────
  async remove(userId: string, noteId: string) {
    const member = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId, noteId } },
    })

    if (!member) throw new NotFoundException('Note topilmadi')
    if (member.role !== 'OWNER') throw new ForbiddenException('Faqat OWNER o\'chira oladi')

    return this.prisma.note.delete({ where: { id: noteId } })
  }
}