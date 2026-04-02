import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  Headers,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { CreateLibraryItemDto, UpdateLibraryItemDto } from './library.dto';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  findAll(@Query('type') type: string, @Headers('x-user-id') userId: string) {
    return this.libraryService.findAll(type, userId);
  }

  @Post()
  create(
    @Body() dto: CreateLibraryItemDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.libraryService.create(dto, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLibraryItemDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.libraryService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.libraryService.delete(id, userId);
  }
}
