import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { InviteMemberDto } from './dto/invite-member.dto'
import { UpdateMemberRoleDto } from './dto/update-member-role.dto'

@Injectable()
export class CollaborationService {
  constructor(private prisma: PrismaService) {}

  // ─── OWNER ekanligini tekshirish ────────────
  private async checkOwner(userId: string, noteId: string) {
    const member = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId, noteId } },
    })
    if (!member) throw new NotFoundException('Note topilmadi')
    if (member.role !== 'OWNER') throw new ForbiddenException('Faqat OWNER bajara oladi')
    return member
  }

  // ─── INVITE LINK YARATISH ───────────────────
  async createInvite(userId: string, noteId: string, dto: InviteMemberDto) {
    await this.checkOwner(userId, noteId)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) 

    const invite = await this.prisma.invite.create({
      data: {
        noteId,
        email: dto.email,
        role: dto.role,
        createdBy: userId,
        expiresAt,
      },
    })

    return {
      inviteLink: `${process.env.FRONTEND_URL}/invite/${invite.token}`,
      token: invite.token,
      expiresAt: invite.expiresAt,
    }
  }

  // ─── INVITE QABUL QILISH ────────────────────
  async acceptInvite(userId: string, token: string) {
    const invite = await this.prisma.invite.findUnique({ where: { token } })

    if (!invite) throw new NotFoundException('Invite topilmadi')
    if (invite.used) throw new BadRequestException('Invite allaqachon ishlatilgan')
    if (invite.expiresAt < new Date()) throw new BadRequestException('Invite muddati tugagan')

    // Member ekanligini tekshirish
    const existing = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId, noteId: invite.noteId } },
    })
    if (existing) throw new BadRequestException('Siz allaqachon bu note\'da a\'zosiz')

    // Member qo'shish
    await this.prisma.noteMember.create({
      data: {
        userId,
        noteId: invite.noteId,
        role: invite.role,
      },
    })

    // Invite ni used qilish
    await this.prisma.invite.update({
      where: { token },
      data: { used: true },
    })

    return { message: 'Note\'ga muvaffaqiyatli qo\'shildingiz', noteId: invite.noteId }
  }

  // ─── MEMBERLARNI KO'RISH ────────────────────
  async getMembers(userId: string, noteId: string) {
    const member = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId, noteId } },
    })
    if (!member) throw new ForbiddenException('Ruxsat yo\'q')

    return this.prisma.noteMember.findMany({
      where: { noteId },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    })
  }

  // ─── ROLE YANGILASH ─────────────────────────
  async updateMemberRole(userId: string, noteId: string, memberId: string, dto: UpdateMemberRoleDto) {
    await this.checkOwner(userId, noteId)

    if (memberId === userId) throw new BadRequestException('O\'z rolingizni o\'zgartira olmaysiz')

    const member = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId: memberId, noteId } },
    })
    if (!member) throw new NotFoundException('Member topilmadi')
    if (member.role === 'OWNER') throw new ForbiddenException('OWNER rolini o\'zgartirish mumkin emas')

    return this.prisma.noteMember.update({
      where: { userId_noteId: { userId: memberId, noteId } },
      data: { role: dto.role },
    })
  }

  // ─── MEMBERNI O'CHIRISH ──────────────────────
  async removeMember(userId: string, noteId: string, memberId: string) {
    await this.checkOwner(userId, noteId)

    if (memberId === userId) throw new BadRequestException('O\'zingizni o\'chira olmaysiz')

    const member = await this.prisma.noteMember.findUnique({
      where: { userId_noteId: { userId: memberId, noteId } },
    })
    if (!member) throw new NotFoundException('Member topilmadi')

    return this.prisma.noteMember.delete({
      where: { userId_noteId: { userId: memberId, noteId } },
    })
  }
}