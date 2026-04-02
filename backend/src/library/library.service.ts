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

  async findAll(type: string, userId: string): Promise<LibraryItem[]> {
    return this.libraryModel
      .find({ type, userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(
    dto: CreateLibraryItemDto,
    userId: string,
  ): Promise<LibraryItem> {
    const newItem = new this.libraryModel({
      ...dto,
      userId,
    });
    return newItem.save();
  }

  async update(
    id: string,
    dto: UpdateLibraryItemDto,
    userId: string,
  ): Promise<LibraryItem | null> {
    return this.libraryModel
      .findOneAndUpdate({ _id: id, userId }, dto, { new: true })
      .exec();
  }

  async delete(id: string, userId: string): Promise<LibraryItem | null> {
    return this.libraryModel.findOneAndDelete({ _id: id, userId }).exec();
  }
}
