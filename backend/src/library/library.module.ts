import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { LibraryItem, LibrarySchema } from './library.schema';

@Module({
  imports: [
    // Registering the schema in this module [cite: 2026-03-26]
    MongooseModule.forFeature([
      { name: LibraryItem.name, schema: LibrarySchema },
    ]),
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  // Export MongooseModule so the model becomes available to other modules [cite: 2026-03-26]
  exports: [MongooseModule, LibraryService],
})
export class LibraryModule {}
