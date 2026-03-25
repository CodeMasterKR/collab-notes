import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldSecret123' })
  @IsString()
  oldPassword: string

  @ApiProperty({ example: 'newSecret123' })
  @IsString()
  @MinLength(6)
  newPassword: string
}