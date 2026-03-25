import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module';
import { NotesModule } from './modules/notes/notes.module';

@Module({
  imports: [PrismaModule, AuthModule, NotesModule],
})
export class AppModule {}