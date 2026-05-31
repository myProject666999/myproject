import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Not, In } from 'typeorm';
import * as dayjs from 'dayjs';
import { Reservation, ReservationStatus, PaymentStatus } from './reservation.entity';
import { SpotService } from '../spot/spot.service';
import { Spot } from '../spot/spot.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private spotService: SpotService,
  ) {}

  generateReservationNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RV${timestamp}${random}`;
  }

  async create(reservationData: Partial<Reservation>): Promise<Reservation> {
    const checkinDate = new Date(reservationData.checkinDate);
    const checkoutDate = new Date(reservationData.checkoutDate);

    if (checkinDate >= checkoutDate) {
      throw new HttpException('Checkout date must be after checkin date', HttpStatus.BAD_REQUEST);
    }

    const isAvailable = await this.spotService.isSpotAvailable(
      reservationData.spotId,
      checkinDate,
      checkoutDate,
    );

    if (!isAvailable) {
      throw new HttpException('Spot is not available for the selected dates', HttpStatus.BAD_REQUEST);
    }

    const spot = await this.spotService.findOne(reservationData.spotId);
    if (!spot) {
      throw new HttpException('Spot not found', HttpStatus.NOT_FOUND);
    }

    const days = dayjs(checkoutDate).diff(dayjs(checkinDate), 'day');
    const baseAmount = this.calculateTotalAmount(spot, checkinDate, checkoutDate);
    const utilityDeposit = 200;

    const reservation = this.reservationRepository.create({
      ...reservationData,
      reservationNo: this.generateReservationNo(),
      days,
      baseAmount,
      utilityDeposit,
      totalAmount: baseAmount + utilityDeposit,
      status: ReservationStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
    });

    return this.reservationRepository.save(reservation);
  }

  calculateTotalAmount(spot: Spot, checkinDate: Date, checkoutDate: Date): number {
    let total = 0;
    let current = dayjs(checkinDate);
    const end = dayjs(checkoutDate);

    while (current.isBefore(end)) {
      const dayOfWeek = current.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (isWeekend && spot.weekendPrice) {
        total += spot.weekendPrice;
      } else {
        total += spot.pricePerDay;
      }
      
      current = current.add(1, 'day');
    }

    return total;
  }

  async findAll(params?: {
    userId?: number;
    campsiteId?: number;
    spotId?: number;
    status?: ReservationStatus;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: Reservation[]; total: number }> {
    const where: any = {};
    if (params?.userId) where.userId = params.userId;
    if (params?.campsiteId) where.campsiteId = params.campsiteId;
    if (params?.spotId) where.spotId = params.spotId;
    if (params?.status) where.status = params.status;

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const [list, total] = await this.reservationRepository.findAndCount({
      where,
      relations: ['user', 'campsite', 'spot'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { list, total };
  }

  async findOne(id: number): Promise<Reservation> {
    return this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'campsite', 'spot', 'rentalOrders', 'utilityUsages', 'checkinRecords', 'reviews'],
    });
  }

  async findByReservationNo(reservationNo: string): Promise<Reservation> {
    return this.reservationRepository.findOne({
      where: { reservationNo },
      relations: ['user', 'campsite', 'spot'],
    });
  }

  async confirm(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new HttpException('Reservation cannot be confirmed', HttpStatus.BAD_REQUEST);
    }

    reservation.status = ReservationStatus.CONFIRMED;
    reservation.paymentStatus = PaymentStatus.PAID;
    reservation.paidAt = new Date();

    await this.reservationRepository.save(reservation);
    return this.findOne(id);
  }

  async cancel(id: number, cancelReason?: string): Promise<Reservation> {
    const reservation = await this.findOne(id);
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }
    if (reservation.status === ReservationStatus.CANCELLED || 
        reservation.status === ReservationStatus.REFUNDED ||
        reservation.status === ReservationStatus.CHECKED_OUT) {
      throw new HttpException('Reservation cannot be cancelled', HttpStatus.BAD_REQUEST);
    }

    const daysBeforeCheckin = dayjs(reservation.checkinDate).diff(dayjs(), 'day');
    const refundPercentage = this.calculateRefundPercentage(daysBeforeCheckin);

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancelledAt = new Date();
    reservation.cancelReason = cancelReason || 'User cancelled';

    await this.reservationRepository.save(reservation);
    return this.findOne(id);
  }

  calculateRefundPercentage(daysBeforeCheckin: number): number {
    if (daysBeforeCheckin >= 7) return 100;
    if (daysBeforeCheckin >= 3) return 70;
    if (daysBeforeCheckin >= 1) return 30;
    return 0;
  }

  async checkin(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new HttpException('Only confirmed reservations can check in', HttpStatus.BAD_REQUEST);
    }

    reservation.status = ReservationStatus.CHECKED_IN;
    reservation.checkinTime = new Date();

    await this.reservationRepository.save(reservation);
    return this.findOne(id);
  }

  async checkout(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }
    if (reservation.status !== ReservationStatus.CHECKED_IN) {
      throw new HttpException('Only checked-in reservations can check out', HttpStatus.BAD_REQUEST);
    }

    reservation.status = ReservationStatus.CHECKED_OUT;
    reservation.checkoutTime = new Date();

    await this.reservationRepository.save(reservation);
    return this.findOne(id);
  }

  async getSpotCalendar(spotId: number, month: string): Promise<any> {
    const startDate = dayjs(month).startOf('month').toDate();
    const endDate = dayjs(month).endOf('month').toDate();

    const reservations = await this.reservationRepository.find({
      where: {
        spotId,
        status: Not(In([ReservationStatus.CANCELLED, ReservationStatus.REFUNDED])),
        checkinDate: LessThan(endDate),
        checkoutDate: MoreThan(startDate),
      },
    });

    const calendar = {};
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      const dayReservations = reservations.filter(r => {
        const rCheckin = dayjs(r.checkinDate);
        const rCheckout = dayjs(r.checkoutDate);
        return current.isAfter(rCheckin.subtract(1, 'day')) && current.isBefore(rCheckout);
      });

      calendar[dateStr] = {
        available: dayReservations.length === 0,
        reservations: dayReservations.length,
      };

      current = current.add(1, 'day');
    }

    return calendar;
  }
}
