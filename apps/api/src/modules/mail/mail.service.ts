import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  async sendOtp(email: string, otp: string) {
    await this.transporter.sendMail({
      from: `"Collab Notes" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Collab Notes</h2>
          <p>Your verification code:</p>
          <div style="
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #4F46E5;
            padding: 20px;
            background: #F3F4F6;
            border-radius: 8px;
            text-align: center;
          ">
            ${otp}
          </div>
          <p style="color: #6B7280; font-size: 14px;">
            This code expires in <strong>5 minutes</strong>.
          </p>
        </div>
      `,
    })
  }

  async sendPasswordReset(email: string, otp: string) {
    await this.transporter.sendMail({
      from: `"Collab Notes" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Collab Notes</h2>
          <p>Password reset code:</p>
          <div style="
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #EF4444;
            padding: 20px;
            background: #FEF2F2;
            border-radius: 8px;
            text-align: center;
          ">
            ${otp}
          </div>
          <p style="color: #6B7280; font-size: 14px;">
            This code expires in <strong>5 minutes</strong>.
            If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    })
  }
}