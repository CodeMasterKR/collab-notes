import { IsString, IsOptional, IsBoolean } from 'class-validator'

export class UpdateCommentDto {
  @IsString()
  @IsOptional()
  text?: string

  @IsBoolean()
  @IsOptional()
  resolved?: boolean
}