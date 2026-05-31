import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Spot, SpotType } from './spot.entity';

@Injectable()
export class SpotService {
  constructor(
    @InjectRepository(Spot)
    private spotRepository: Repository<Spot>,
    @InjectRepository(SpotType)
    private spotTypeRepository: Repository<SpotType>,
  ) {}

  async create(spotData: Partial<Spot>): Promise<Spot> {
    const spot = this.spotRepository.create(spotData);
    return this.spotRepository.save(spot);
  }

  async findAll(campsiteId?: number, typeId?: number): Promise<Spot[]> {
    const where: any = { status: 1 };
    if (campsiteId) where.campsiteId = campsiteId;
    if (typeId) where.typeId = typeId;

    return this.spotRepository.find({
      where,
      relations: ['type', 'campsite'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Spot> {
    return this.spotRepository.findOne({
      where: { id },
      relations: ['type', 'campsite', 'utilityPoles'],
    });
  }

  async findAvailableSpots(
    campsiteId: number,
    checkinDate: Date,
    checkoutDate: Date,
  ): Promise<Spot[]> {
    const spots = await this.spotRepository.find({
      where: { campsiteId, status: 1 },
      relations: ['type', 'reservations'],
    });

    return spots.filter(spot => {
      const conflictingReservations = spot.reservations?.filter(r => {
        const rCheckin = new Date(r.checkinDate);
        const rCheckout = new Date(r.checkoutDate);
        const reqCheckin = new Date(checkinDate);
        const reqCheckout = new Date(checkoutDate);

        return (
          r.status !== 'cancelled' &&
          r.status !== 'refunded' &&
          !(reqCheckout <= rCheckin || reqCheckin >= rCheckout)
        );
      });

      return !conflictingReservations || conflictingReservations.length === 0;
    });
  }

  async update(id: number, updateData: Partial<Spot>): Promise<Spot> {
    await this.spotRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.spotRepository.delete(id);
  }

  async findAllSpotTypes(): Promise<SpotType[]> {
    return this.spotTypeRepository.find();
  }

  async isSpotAvailable(
    spotId: number,
    checkinDate: Date,
    checkoutDate: Date,
    excludeReservationId?: number,
  ): Promise<boolean> {
    const spot = await this.spotRepository.findOne({
      where: { id: spotId },
      relations: ['reservations'],
    });

    if (!spot) return false;

    const conflictingReservations = spot.reservations?.filter(r => {
      const rCheckin = new Date(r.checkinDate);
      const rCheckout = new Date(r.checkoutDate);
      const reqCheckin = new Date(checkinDate);
      const reqCheckout = new Date(checkoutDate);

      return (
        r.id !== excludeReservationId &&
        r.status !== 'cancelled' &&
        r.status !== 'refunded' &&
        !(reqCheckout <= rCheckin || reqCheckin >= rCheckout)
      );
    });

    return !conflictingReservations || conflictingReservations.length === 0;
  }
}
