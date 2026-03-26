import { Module, forwardRef } from '@nestjs/common';
import { CommentService } from './comments.service';
import { CommentController } from './comments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotesModule } from '../notes/notes.module'; // Gateway export qilingan modul yo'li

@Module({
  imports: [
    PrismaModule, 
    // NotesModule ichida NotesGateway export qilingan bo'lishi kerak.
    // forwardRef socket va service bir-birini kutib turishi uchun shart.
    forwardRef(() => NotesModule),
  ],
  controllers: [CommentController],
  providers: [CommentService],
  // Agar boshqa modullarda comment service kerak bo'lsa export qilamiz
  exports: [CommentService],
})
export class CommentModule {}