import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LibraryItem } from './library.schema';
import { CreateLibraryItemDto, UpdateLibraryItemDto } from './library.dto';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(LibraryItem.name)
    private readonly libraryModel: Model<LibraryItem>,
  ) {}

  async findAll(type: string): Promise<LibraryItem[]> {
    return this.libraryModel.find({ type }).sort({ createdAt: -1 }).exec();
  }

  async create(dto: CreateLibraryItemDto): Promise<LibraryItem> {
    const newItem = new this.libraryModel(dto);
    return newItem.save();
  }

  async update(
    id: string,
    dto: UpdateLibraryItemDto,
  ): Promise<LibraryItem | null> {
    return this.libraryModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async delete(id: string): Promise<LibraryItem | null> {
    return this.libraryModel.findByIdAndDelete(id).exec();
  }
}
