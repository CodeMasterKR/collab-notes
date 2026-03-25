import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module';
import { NotesModule } from './modules/notes/notes.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';

@Module({
  imports: [PrismaModule, AuthModule, NotesModule, CollaborationModule],
})
export class AppModule {}