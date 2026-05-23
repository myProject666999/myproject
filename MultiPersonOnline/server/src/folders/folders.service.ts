import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  async create(
    createFolderDto: CreateFolderDto,
    userId: number,
  ): Promise<Folder> {
    const folder = this.folderRepository.create({
      ...createFolderDto,
      parentId: createFolderDto.parentId ?? 0,
      ownerId: userId,
    });
    return this.folderRepository.save(folder);
  }

  async findByOwner(
    ownerId: number,
    parentId: number = 0,
  ): Promise<Folder[]> {
    return this.folderRepository.find({
      where: { ownerId, parentId },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Folder> {
    const folder = await this.folderRepository.findOne({ where: { id } });
    if (!folder) throw new NotFoundException('文件夹不存在');
    return folder;
  }

  async update(
    id: number,
    updateFolderDto: UpdateFolderDto,
    userId: number,
  ): Promise<Folder> {
    const folder = await this.findOne(id);
    if (folder.ownerId !== userId) {
      throw new ForbiddenException('无权修改该文件夹');
    }
    Object.assign(folder, updateFolderDto);
    return this.folderRepository.save(folder);
  }

  async remove(id: number, userId: number): Promise<void> {
    const folder = await this.findOne(id);
    if (folder.ownerId !== userId) {
      throw new ForbiddenException('无权删除该文件夹');
    }
    await this.folderRepository.softDelete(id);
  }
}
