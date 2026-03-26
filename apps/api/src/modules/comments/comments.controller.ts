import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CommentService } from './comments.service';

@UseGuards(JwtAuthGuard)
@Controller('notes/:noteId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  findAll(@Param('noteId') noteId: string, @Req() req: any) {
    return this.commentService.findAll(noteId, req.user.id);
  }

  @Post()
  create(
    @Param('noteId') noteId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.commentService.create(noteId, req.user.id, dto);
  }

  @Patch(':commentId')
  update(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: any,
  ) {
    return this.commentService.update(commentId, req.user.id, dto);
  }

  @Patch(':commentId/resolve')
  resolve(
    @Param('noteId') noteId: string,
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    return this.commentService.resolve(commentId, req.user.id, noteId);
  }

  @Delete(':commentId')
  remove(@Param('commentId') commentId: string, @Req() req: any) {
    return this.commentService.remove(commentId, req.user.id);
  }
}
