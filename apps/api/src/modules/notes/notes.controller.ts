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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateNoteDto) {
    return this.notesService.create(user.id, dto);
  }

  @Get(':id/my-role')
  getMyRole(@Param('id') noteId: string, @Req() req: any) {
    return this.notesService.getMyRole(req.user.id, noteId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.notesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notesService.remove(user.id, id);
  }

  @Get(':id/versions')
  getVersions(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notesService.getVersions(user.id, id);
  }

  @Patch(':id/members/:userId/role')
updateMemberRole(
  @CurrentUser() user: any,
  @Param('id') noteId: string,
  @Param('userId') targetUserId: string,
  @Body('role') role: Role,
) {
  return this.notesService.updateMemberRole(user.id, noteId, targetUserId, role)
}
}
