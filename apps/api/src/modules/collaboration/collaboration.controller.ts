import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CollaborationService } from './collaboration.service'
import { InviteMemberDto } from './dto/invite-member.dto'
import { UpdateMemberRoleDto } from './dto/update-member-role.dto'
import { JwtAuthGuard } from '../common/guards/jwt.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Collaboration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CollaborationController {
  constructor(private collaborationService: CollaborationService) {}

  @Post('notes/:noteId/invite')
  createInvite(
    @CurrentUser() user: any,
    @Param('noteId') noteId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.collaborationService.createInvite(user.id, noteId, dto)
  }

  @Post('invite/:token/accept')
  acceptInvite(@CurrentUser() user: any, @Param('token') token: string) {
    return this.collaborationService.acceptInvite(user.id, token)
  }

  @Get('notes/:noteId/members')
  getMembers(@CurrentUser() user: any, @Param('noteId') noteId: string) {
    return this.collaborationService.getMembers(user.id, noteId)
  }

  @Patch('notes/:noteId/members/:memberId/role')
  updateRole(
    @CurrentUser() user: any,
    @Param('noteId') noteId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.collaborationService.updateMemberRole(user.id, noteId, memberId, dto)
  }

  @Delete('notes/:noteId/members/:memberId')
  removeMember(
    @CurrentUser() user: any,
    @Param('noteId') noteId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.collaborationService.removeMember(user.id, noteId, memberId)
  }
}