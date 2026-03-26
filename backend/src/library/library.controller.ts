import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { CreateLibraryItemDto, UpdateLibraryItemDto } from './library.dto';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  findAll(@Query('type') type: string) {
    return this.libraryService.findAll(type);
  }

  @Post()
  create(@Body() dto: CreateLibraryItemDto) {
    return this.libraryService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLibraryItemDto) {
    return this.libraryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.libraryService.delete(id);
  }
}
