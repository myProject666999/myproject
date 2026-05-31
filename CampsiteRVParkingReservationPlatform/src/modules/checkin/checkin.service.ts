import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { CheckinRecord, CheckinMethod } from './checkin.entity';
import { ReservationService } from '../reservation/reservation.service';
import { ReservationStatus } from '../reservation/reservation.entity';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(CheckinRecord)
    private checkinRecordRepository: Repository<CheckinRecord>,
    private reservationService: ReservationService,
  ) {}

  generateCheckinCode(reservationId: number): string {
    const hash = crypto.createHash('md5');
    hash.update(`${reservationId}-${Date.now()}-${Math.random()}`);
    return hash.digest('hex').substring(0, 8).toUpperCase();
  }

  generateQRCodeContent(checkinCode: string): string {
    return `campsite://checkin/${checkinCode}`;
  }

  async createCheckinRecord(reservationId: number, userId: number): Promise<CheckinRecord> {
    const reservation = await this.reservationService.findOne(reservationId);
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new HttpException('Only confirmed reservations can check in', HttpStatus.BAD_REQUEST);
    }

    const existingRecord = await this.checkinRecordRepository.findOne({
      where: { reservationId },
    });
    if (existingRecord) {
      return existingRecord;
    }

    const checkinCode = this.generateCheckinCode(reservationId);
    const qrCode = this.generateQRCodeContent(checkinCode);

    const record = this.checkinRecordRepository.create({
      reservationId,
      userId,
      checkinCode,
      qrCode,
    });

    return this.checkinRecordRepository.save(record);
  }

  async verifyCheckin(
    checkinCode: string,
    checkinMethod: CheckinMethod,
    checkedBy: number,
  ): Promise<CheckinRecord> {
    const record = await this.checkinRecordRepository.findOne({
      where: { checkinCode },
      relations: ['reservation'],
    });

    if (!record) {
      throw new HttpException('Invalid checkin code', HttpStatus.NOT_FOUND);
    }

    if (record.checkedBy) {
      throw new HttpException('Already checked in', HttpStatus.BAD_REQUEST);
    }

    record.checkinMethod = checkinMethod;
    record.checkedBy = checkedBy;
    await this.checkinRecordRepository.save(record);

    await this.reservationService.checkin(record.reservationId);

    return this.checkinRecordRepository.findOne({
      where: { id: record.id },
      relations: ['reservation', 'user'],
    });
  }

  async verifyManualCheckin(
    reservationId: number,
    checkedBy: number,
    guests?: any[],
    vehiclePlate?: string,
    remark?: string,
  ): Promise<CheckinRecord> {
    const record = await this.checkinRecordRepository.findOne({
      where: { reservationId },
    });

    if (!record) {
      const reservation = await this.reservationService.findOne(reservationId);
      if (!reservation) {
        throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
      }
      return this.createCheckinRecord(reservationId, reservation.userId);
    }

    if (record.checkedBy) {
      throw new HttpException('Already checked in', HttpStatus.BAD_REQUEST);
    }

    record.checkinMethod = CheckinMethod.MANUAL;
    record.checkedBy = checkedBy;
    record.guests = guests;
    record.vehiclePlate = vehiclePlate;
    record.remark = remark;
    await this.checkinRecordRepository.save(record);

    await this.reservationService.checkin(reservationId);

    return this.checkinRecordRepository.findOne({
      where: { id: record.id },
      relations: ['reservation', 'user'],
    });
  }

  async findByReservation(reservationId: number): Promise<CheckinRecord> {
    return this.checkinRecordRepository.findOne({
      where: { reservationId },
      relations: ['reservation', 'user', 'checker'],
    });
  }

  async findByCheckinCode(checkinCode: string): Promise<CheckinRecord> {
    return this.checkinRecordRepository.findOne({
      where: { checkinCode },
      relations: ['reservation', 'user'],
    });
  }

  async findCheckinRecords(params?: {
    campsiteId?: number;
    date?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: CheckinRecord[]; total: number }> {
    const where: any = {};
    if (params?.campsiteId) {
      where['reservation.campsiteId'] = params.campsiteId;
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const [list, total] = await this.checkinRecordRepository.findAndCount({
      where,
      relations: ['reservation', 'user', 'checker'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { list, total };
  }
}
