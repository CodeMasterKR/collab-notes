import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'ibrahimovkamronbek77@gmail.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: '123456' })
  @IsString()
  password: string
}