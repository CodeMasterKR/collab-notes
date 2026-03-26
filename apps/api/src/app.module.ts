import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotesModule } from './modules/notes/notes.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { CommentModule } from './modules/comments/comments.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    NotesModule,
    CollaborationModule,
    CommentModule,
  ],
})
export class AppModule {}
