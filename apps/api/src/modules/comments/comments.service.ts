// comment.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { COMMENT_EVENTS } from './comment.events';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    // ✅ forwardRef o'rniga EventEmitter2 — circular dependency yo'q
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── Yordamchi metodlar ───────────────────────────────────────────────────

  private async assertNoteMember(userId: string, noteId: string) {
    const member = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId, noteId } },
    });
    if (!member) {
      throw new ForbiddenException('Sizda ushbu notega ruxsat yo\'q');
    }
  }

  private async findCommentOrThrow(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment topilmadi');
    return comment;
  }

  // ─── BARCHA COMMENTLARNI OLISH ────────────────────────────────────────────

  async findAll(noteId: string, userId: string) {
    // ✅ Faqat note a'zolari ko'ra oladi
    await this.assertNoteMember(userId, noteId);

    return this.prisma.comment.findMany({
      where: { noteId, parentId: null },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── COMMENT YARATISH ─────────────────────────────────────────────────────

  async create(noteId: string, userId: string, dto: CreateCommentDto) {
    // ✅ Note mavjudligi + member tekshiruvi birlashtirildi
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundException('Eslatma topilmadi');

    await this.assertNoteMember(userId, noteId);

    if (dto.parentId) {
      const parent = await this.findCommentOrThrow(dto.parentId);

      // ✅ Parent boshqa notega tegishli bo'lmasligi kerak
      if (parent.noteId !== noteId) {
        throw new ForbiddenException('Parent comment boshqa notega tegishli');
      }

      // ✅ Nested reply taqiqlangan
      if (parent.parentId) {
        throw new ForbiddenException('Reply ichiga reply yozib bo\'lmaydi');
      }
    }

    const newComment = await this.prisma.comment.create({
      data: {
        text: dto.text,
        noteId,
        userId,
        parentId: dto.parentId ?? null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    // ✅ Gateway to'g'ridan-to'g'ri chaqirilmaydi — event orqali
    this.eventEmitter.emit(COMMENT_EVENTS.CREATED, { noteId, comment: newComment });

    return newComment;
  }

  // ─── COMMENT TAHRIRLASH ───────────────────────────────────────────────────

  async update(commentId: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.findCommentOrThrow(commentId);

    // ✅ Note member ekanligi tekshiriladi
    await this.assertNoteMember(userId, comment.noteId);

    if (comment.userId !== userId) {
      throw new ForbiddenException('Faqat o\'z commentingizni tahrirlay olasiz');
    }

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { text: dto.text },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    this.eventEmitter.emit(COMMENT_EVENTS.UPDATED, {
      noteId: comment.noteId,
      comment: updated,
    });

    return updated;
  }

  // ─── RESOLVE TOGGLE ───────────────────────────────────────────────────────

  async resolve(commentId: string, userId: string, noteId: string) {
    const comment = await this.findCommentOrThrow(commentId);

    // ✅ Comment haqiqatan shu notega tegishli ekanini tekshirish
    if (comment.noteId !== noteId) {
      throw new ForbiddenException('Comment ushbu notega tegishli emas');
    }

    await this.assertNoteMember(userId, noteId);

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { resolved: !comment.resolved },
    });

    this.eventEmitter.emit(COMMENT_EVENTS.RESOLVED, {
      noteId,
      id: commentId,
      resolved: updated.resolved,
    });

    return updated;
  }

  // ─── COMMENT O'CHIRISH ────────────────────────────────────────────────────

  async remove(commentId: string, userId: string) {
    const comment = await this.findCommentOrThrow(commentId);

    if (comment.userId !== userId) {
      throw new ForbiddenException('Faqat o\'z commentingizni o\'chira olasiz');
    }

    // ✅ deleteMany + delete atomic transaction ichida
    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({ where: { parentId: commentId } }),
      this.prisma.comment.delete({ where: { id: commentId } }),
    ]);

    this.eventEmitter.emit(COMMENT_EVENTS.DELETED, {
      noteId: comment.noteId,
      id: commentId,
    });

    return { success: true };
  }
}