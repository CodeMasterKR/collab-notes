import { IsString, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateNoteDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string
}