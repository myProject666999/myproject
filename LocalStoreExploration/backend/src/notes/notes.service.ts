import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { Note } from '../entities/note.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    private redisService: RedisService,
  ) {}

  private sanitizeNote(note: any) {
    const plain = instanceToPlain(note) as any;
    if (plain.user) {
      const { password, ...userWithoutPassword } = plain.user;
      plain.user = userWithoutPassword;
    }
    return plain;
  }

  async findNearby(lng: number, lat: number, radius: number = 5, category?: string) {
    let query = this.noteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.user', 'user')
      .leftJoinAndSelect('note.shop', 'shop')
      .where('note.status = :status', { status: 'approved' });

    if (category) {
      query = query.andWhere('note.category = :category', { category });
    }

    const notes = await query
      .orderBy('note.createdAt', 'DESC')
      .take(50)
      .getMany();

    return notes.map(note => ({
      ...this.sanitizeNote(note),
      distance: this.calculateDistance(lat, lng, note.lat, note.lng),
    })).sort((a, b) => a.distance - b.distance).slice(0, 20);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async findById(id: number) {
    const note = await this.noteRepository.findOne({
      where: { id },
      relations: ['user', 'shop'],
    });
    return note ? this.sanitizeNote(note) : null;
  }

  async findByShopId(shopId: number, page: number = 1, limit: number = 20) {
    const [notes, total] = await this.noteRepository.findAndCount({
      where: { shopId, status: 'approved' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      list: notes.map(note => this.sanitizeNote(note)),
      total,
      page,
      limit,
    };
  }

  async create(userId: number, data: any) {
    const note = this.noteRepository.create({
      userId,
      ...data,
      status: 'pending',
    });
    const savedNote = await this.noteRepository.save(note);

    await this.redisService.geoAdd('geo:notes', data.lng, data.lat, (savedNote as any).id.toString());

    return savedNote;
  }

  async incrementViews(id: number) {
    return this.noteRepository.increment({ id }, 'viewsCount', 1);
  }
}
