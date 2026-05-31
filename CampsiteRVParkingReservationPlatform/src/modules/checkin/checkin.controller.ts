import { Controller, Get, Post, Put, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CheckinRecord, CheckinMethod } from './checkin.entity';

@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post('create')
  async createCheckinRecord(
    @Body('reservationId') reservationId: number,
    @Body('userId') userId: number,
  ): Promise<CheckinRecord> {
    if (!reservationId || !userId) {
      throw new HttpException('reservationId and userId are required', HttpStatus.BAD_REQUEST);
    }
    return this.checkinService.createCheckinRecord(reservationId, userId);
  }

  @Post('verify')
  async verifyCheckin(
    @Body('checkinCode') checkinCode: string,
    @Body('checkinMethod') checkinMethod: CheckinMethod,
    @Body('checkedBy') checkedBy: number,
  ): Promise<CheckinRecord> {
    if (!checkinCode || !checkedBy) {
      throw new HttpException('checkinCode and checkedBy are required', HttpStatus.BAD_REQUEST);
    }
    return this.checkinService.verifyCheckin(
      checkinCode,
      checkinMethod || CheckinMethod.CODE,
      checkedBy,
    );
  }

  @Post('manual')
  async verifyManualCheckin(
    @Body('reservationId') reservationId: number,
    @Body('checkedBy') checkedBy: number,
    @Body('guests') guests?: any[],
    @Body('vehiclePlate') vehiclePlate?: string,
    @Body('remark') remark?: string,
  ): Promise<CheckinRecord> {
    if (!reservationId || !checkedBy) {
      throw new HttpException('reservationId and checkedBy are required', HttpStatus.BAD_REQUEST);
    }
    return this.checkinService.verifyManualCheckin(
      reservationId,
      checkedBy,
      guests,
      vehiclePlate,
      remark,
    );
  }

  @Get('reservation/:reservationId')
  async findByReservation(@Param('reservationId') reservationId: string): Promise<CheckinRecord> {
    const record = await this.checkinService.findByReservation(+reservationId);
    if (!record) {
      throw new HttpException('Checkin record not found', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  @Get('code/:checkinCode')
  async findByCheckinCode(@Param('checkinCode') checkinCode: string): Promise<CheckinRecord> {
    const record = await this.checkinService.findByCheckinCode(checkinCode);
    if (!record) {
      throw new HttpException('Checkin record not found', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  @Get('records')
  async findCheckinRecords(
    @Query('campsiteId') campsiteId?: string,
    @Query('date') date?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<{ list: CheckinRecord[]; total: number }> {
    return this.checkinService.findCheckinRecords({
      campsiteId: campsiteId ? +campsiteId : undefined,
      date,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }
}
