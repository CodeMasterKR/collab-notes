import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { NotesService } from './notes.service'
import { NotesController } from './notes.controller'
import { NotesGateway } from './notes.gateway'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [NotesService, NotesGateway],
  controllers: [NotesController],
  exports: [NotesService],
})
export class NotesModule {}