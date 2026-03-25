import { Injectable } from '@nestjs/common'

@Injectable()
export class OtpService {
  generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  expiresAt(): Date {
    const date = new Date()
    date.setMinutes(date.getMinutes() + 5) // 5 daqiqa
    return date
  }

  isExpired(otpExpiresAt: Date): boolean {
    return new Date() > otpExpiresAt
  }
}