import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation, ReservationStatus } from './reservation.entity';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  async create(@Body() reservationData: Partial<Reservation>): Promise<Reservation> {
    return this.reservationService.create(reservationData);
  }

  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query('campsiteId') campsiteId?: string,
    @Query('spotId') spotId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<{ list: Reservation[]; total: number }> {
    return this.reservationService.findAll({
      userId: userId ? +userId : undefined,
      campsiteId: campsiteId ? +campsiteId : undefined,
      spotId: spotId ? +spotId : undefined,
      status: status as ReservationStatus,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get('no/:reservationNo')
  async findByReservationNo(@Param('reservationNo') reservationNo: string): Promise<Reservation> {
    const reservation = await this.reservationService.findByReservationNo(reservationNo);
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }
    return reservation;
  }

  @Get('spot-calendar')
  async getSpotCalendar(
    @Query('spotId') spotId: string,
    @Query('month') month: string,
  ): Promise<any> {
    if (!spotId || !month) {
      throw new HttpException('Missing required parameters', HttpStatus.BAD_REQUEST);
    }
    return this.reservationService.getSpotCalendar(+spotId, month);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Reservation> {
    const reservation = await this.reservationService.findOne(+id);
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }
    return reservation;
  }

  @Put(':id/confirm')
  async confirm(@Param('id') id: string): Promise<Reservation> {
    return this.reservationService.confirm(+id);
  }

  @Put(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body('cancelReason') cancelReason?: string,
  ): Promise<Reservation> {
    return this.reservationService.cancel(+id, cancelReason);
  }

  @Put(':id/checkin')
  async checkin(@Param('id') id: string): Promise<Reservation> {
    return this.reservationService.checkin(+id);
  }

  @Put(':id/checkout')
  async checkout(@Param('id') id: string): Promise<Reservation> {
    return this.reservationService.checkout(+id);
  }
}
