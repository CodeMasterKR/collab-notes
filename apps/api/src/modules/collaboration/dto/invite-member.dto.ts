import { IsEmail, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@prisma/client'

export class InviteMemberDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({ enum: Role, default: Role.EDITOR })
  @IsEnum(Role)
  role: Role = Role.EDITOR
}