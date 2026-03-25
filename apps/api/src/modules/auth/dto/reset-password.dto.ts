import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Length, MinLength } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({ example: 'kamron@gmail.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: '348921' })
  @IsString()
  @Length(6, 6)
  otp: string

  @ApiProperty({ example: 'newSecret123' })
  @IsString()
  @MinLength(6)
  newPassword: string
}