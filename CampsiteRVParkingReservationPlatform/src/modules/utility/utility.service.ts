import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UtilityPole, UtilityUsage, UtilityPoleType, UtilityUsageStatus } from './utility.entity';
import { Reservation } from '../reservation/reservation.entity';

@Injectable()
export class UtilityService {
  constructor(
    @InjectRepository(UtilityPole)
    private utilityPoleRepository: Repository<UtilityPole>,
    @InjectRepository(UtilityUsage)
    private utilityUsageRepository: Repository<UtilityUsage>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
  ) {}

  async findPolesByCampsite(campsiteId: number, spotId?: number): Promise<UtilityPole[]> {
    const where: any = { campsiteId, status: 1 };
    if (spotId !== undefined) where.spotId = spotId;

    return this.utilityPoleRepository.find({
      where,
      relations: ['spot'],
      order: { poleNo: 'ASC' },
    });
  }

  async findPole(id: number): Promise<UtilityPole> {
    return this.utilityPoleRepository.findOne({
      where: { id },
      relations: ['campsite', 'spot'],
    });
  }

  async createPole(poleData: Partial<UtilityPole>): Promise<UtilityPole> {
    const pole = this.utilityPoleRepository.create(poleData);
    return this.utilityPoleRepository.save(pole);
  }

  async updatePole(id: number, updateData: Partial<UtilityPole>): Promise<UtilityPole> {
    await this.utilityPoleRepository.update(id, updateData);
    return this.findPole(id);
  }

  async startUsage(reservationId: number, poleId: number): Promise<UtilityUsage> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['spot'],
    });
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    const pole = await this.findPole(poleId);
    if (!pole) {
      throw new HttpException('Utility pole not found', HttpStatus.NOT_FOUND);
    }

    const existingUsage = await this.utilityUsageRepository.findOne({
      where: { reservationId, status: UtilityUsageStatus.ACTIVE },
    });
    if (existingUsage) {
      throw new HttpException('Utility usage already started', HttpStatus.BAD_REQUEST);
    }

    const usage = this.utilityUsageRepository.create({
      reservationId,
      poleId,
      startElectricReading: pole.initialElectricReading,
      startWaterReading: pole.initialWaterReading,
      electricPrice: 1.50,
      waterPrice: 5.00,
      status: UtilityUsageStatus.ACTIVE,
    });

    return this.utilityUsageRepository.save(usage);
  }

  async endUsage(reservationId: number, endElectricReading: number, endWaterReading: number): Promise<UtilityUsage> {
    const usage = await this.utilityUsageRepository.findOne({
      where: { reservationId, status: UtilityUsageStatus.ACTIVE },
      relations: ['pole'],
    });
    if (!usage) {
      throw new HttpException('No active utility usage found', HttpStatus.NOT_FOUND);
    }

    const electricUsage = Math.max(0, endElectricReading - usage.startElectricReading);
    const waterUsage = Math.max(0, endWaterReading - usage.startWaterReading);
    const electricFee = electricUsage * usage.electricPrice;
    const waterFee = waterUsage * usage.waterPrice;
    const totalFee = electricFee + waterFee;

    usage.endElectricReading = endElectricReading;
    usage.endWaterReading = endWaterReading;
    usage.electricUsage = electricUsage;
    usage.waterUsage = waterUsage;
    usage.electricFee = electricFee;
    usage.waterFee = waterFee;
    usage.totalFee = totalFee;
    usage.status = UtilityUsageStatus.SETTLED;

    await this.utilityUsageRepository.save(usage);

    await this.utilityPoleRepository.update(usage.poleId, {
      initialElectricReading: endElectricReading,
      initialWaterReading: endWaterReading,
    });

    return this.utilityUsageRepository.findOne({ where: { id: usage.id } });
  }

  async findUsageByReservation(reservationId: number): Promise<UtilityUsage[]> {
    return this.utilityUsageRepository.find({
      where: { reservationId },
      relations: ['pole'],
      order: { createdAt: 'DESC' },
    });
  }

  async calculateUtilityFee(usageId: number): Promise<{
    electricUsage: number;
    waterUsage: number;
    electricFee: number;
    waterFee: number;
    totalFee: number;
  }> {
    const usage = await this.utilityUsageRepository.findOne({ where: { id: usageId } });
    if (!usage) {
      throw new HttpException('Utility usage not found', HttpStatus.NOT_FOUND);
    }

    if (usage.status === UtilityUsageStatus.SETTLED) {
      return {
        electricUsage: usage.electricUsage,
        waterUsage: usage.waterUsage,
        electricFee: usage.electricFee,
        waterFee: usage.waterFee,
        totalFee: usage.totalFee,
      };
    }

    const pole = await this.findPole(usage.poleId);
    const electricUsage = Math.max(0, pole.initialElectricReading - usage.startElectricReading);
    const waterUsage = Math.max(0, pole.initialWaterReading - usage.startWaterReading);
    const electricFee = electricUsage * usage.electricPrice;
    const waterFee = waterUsage * usage.waterPrice;
    const totalFee = electricFee + waterFee;

    return {
      electricUsage,
      waterUsage,
      electricFee,
      waterFee,
      totalFee,
    };
  }
}
