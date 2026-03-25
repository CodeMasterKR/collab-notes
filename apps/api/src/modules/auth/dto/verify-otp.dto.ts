import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Length } from 'class-validator'

export class VerifyOtpDto {
  @ApiProperty({ example: 'ibrahimovkamronbek77@gmail.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: '348921' })
  @IsString()
  @Length(6, 6)
  otp: string
}