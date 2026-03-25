import { ApiProperty } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ibrahimovkamronbek77@gmail.com' })
  @IsEmail()
  email: string
}