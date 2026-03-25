import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import { OtpService } from './otp.service'
import * as bcrypt from 'bcrypt'
import { RegisterDto } from './dto/register.dto'
import { VerifyOtpDto } from './dto/verify-otp.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { ChangePasswordDto } from './dto/change-password.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
    private otp: OtpService,
  ) {}

  // ─── REGISTER ───────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (exists) throw new ConflictException('Email already exists')

    const hashed = await bcrypt.hash(dto.password, 10)
    const otpCode = this.otp.generate()
    const otpExpiresAt = this.otp.expiresAt()

    await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        otp: otpCode,
        otpExpiresAt,
        isVerified: false,
      },
    })

    await this.mail.sendOtp(dto.email, otpCode)

    return { message: 'OTP sent to your email' }
  }

  // ─── VERIFY OTP (register) ──────────────────
  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (!user) throw new BadRequestException('User not found')
    if (user.isVerified) throw new BadRequestException('Already verified')
    if (user.otp !== dto.otp) throw new BadRequestException('Invalid OTP')
    if (this.otp.isExpired(user.otpExpiresAt!)) {
      throw new BadRequestException('OTP expired')
    }

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { isVerified: true, otp: null, otpExpiresAt: null },
    })

    return this.signTokens(user.id, user.email)
  }

  // ─── LOGIN ──────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.password)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first')
    }

    return this.signTokens(user.id, user.email)
  }

  // ─── REFRESH TOKEN ──────────────────────────
  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.jwt.verify(dto.refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      })
      return this.signTokens(payload.sub, payload.email)
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  // ─── FORGOT PASSWORD ────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (!user) throw new BadRequestException('User not found')

    const otpCode = this.otp.generate()
    const otpExpiresAt = this.otp.expiresAt()

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { otp: otpCode, otpExpiresAt },
    })

    await this.mail.sendPasswordReset(dto.email, otpCode)

    return { message: 'Password reset OTP sent to your email' }
  }

  // ─── RESET PASSWORD ─────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (!user) throw new BadRequestException('User not found')
    if (user.otp !== dto.otp) throw new BadRequestException('Invalid OTP')
    if (this.otp.isExpired(user.otpExpiresAt!)) {
      throw new BadRequestException('OTP expired')
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10)

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { password: hashed, otp: null, otpExpiresAt: null },
    })

    return { message: 'Password reset successfully' }
  }

  // ─── CHANGE PASSWORD ────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UnauthorizedException()

    const valid = await bcrypt.compare(dto.oldPassword, user.password)
    if (!valid) throw new BadRequestException('Old password is incorrect')

    const hashed = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return { message: 'Password changed successfully' }
  }

  // ─── GET ME ─────────────────────────────────
  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatar: true, isVerified: true },
    })
  }

  // ─── SIGN TOKENS ────────────────────────────
  private async signTokens(userId: string, email: string) {
    const payload = { sub: userId, email }

    const access_token = this.jwt.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    })

    const refresh_token = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expiresIn: '7d',
    })

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: refresh_token },
    })

    return { access_token, refresh_token }
  }
}