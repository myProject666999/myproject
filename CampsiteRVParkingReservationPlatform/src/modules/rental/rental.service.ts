import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { RentalCategory, RentalItem, RentalOrder, RentalOrderStatus } from './rental.entity';

@Injectable()
export class RentalService {
  constructor(
    @InjectRepository(RentalCategory)
    private rentalCategoryRepository: Repository<RentalCategory>,
    @InjectRepository(RentalItem)
    private rentalItemRepository: Repository<RentalItem>,
    @InjectRepository(RentalOrder)
    private rentalOrderRepository: Repository<RentalOrder>,
  ) {}

  generateOrderNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RL${timestamp}${random}`;
  }

  async findAllCategories(): Promise<RentalCategory[]> {
    return this.rentalCategoryRepository.find({ order: { sortOrder: 'ASC' } });
  }

  async findItemsByCampsite(campsiteId: number, categoryId?: number): Promise<RentalItem[]> {
    const where: any = { campsiteId, status: 1 };
    if (categoryId) where.categoryId = categoryId;

    return this.rentalItemRepository.find({
      where,
      relations: ['campsite'],
      order: { name: 'ASC' },
    });
  }

  async findItem(id: number): Promise<RentalItem> {
    return this.rentalItemRepository.findOne({
      where: { id },
      relations: ['campsite'],
    });
  }

  async createItem(itemData: Partial<RentalItem>): Promise<RentalItem> {
    const item = this.rentalItemRepository.create({
      ...itemData,
      availableQuantity: itemData.totalQuantity,
    });
    return this.rentalItemRepository.save(item);
  }

  async updateItem(id: number, updateData: Partial<RentalItem>): Promise<RentalItem> {
    if (updateData.totalQuantity !== undefined) {
      const item = await this.findItem(id);
      const diff = updateData.totalQuantity - item.totalQuantity;
      updateData.availableQuantity = item.availableQuantity + diff;
    }
    
    await this.rentalItemRepository.update(id, updateData);
    return this.findItem(id);
  }

  async checkInventory(
    itemId: number,
    quantity: number,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const item = await this.findItem(itemId);
    if (!item) return false;

    const overlappingOrders = await this.rentalOrderRepository
      .createQueryBuilder('o')
      .where('o.item_id = :itemId', { itemId })
      .andWhere('o.status NOT IN (:...statuses)', {
        statuses: [RentalOrderStatus.CANCELLED, RentalOrderStatus.RETURNED],
      })
      .andWhere(
        'NOT (o.end_date < :startDate OR o.start_date > :endDate)',
        { startDate, endDate },
      )
      .getMany();

    const rentedQuantity = overlappingOrders.reduce((sum, o) => sum + o.quantity, 0);
    return item.availableQuantity >= quantity;
  }

  async createOrder(orderData: Partial<RentalOrder>): Promise<RentalOrder> {
    const startDate = new Date(orderData.startDate);
    const endDate = new Date(orderData.endDate);

    if (startDate >= endDate) {
      throw new HttpException('End date must be after start date', HttpStatus.BAD_REQUEST);
    }

    const isAvailable = await this.checkInventory(
      orderData.itemId,
      orderData.quantity,
      startDate,
      endDate,
    );

    if (!isAvailable) {
      throw new HttpException('Insufficient inventory for the selected dates', HttpStatus.BAD_REQUEST);
    }

    const item = await this.findItem(orderData.itemId);
    const days = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
    const rentalFee = item.pricePerDay * days * orderData.quantity;
    const deposit = item.deposit * orderData.quantity;

    const order = this.rentalOrderRepository.create({
      ...orderData,
      orderNo: this.generateOrderNo(),
      days,
      rentalFee,
      deposit,
      totalAmount: rentalFee + deposit,
      status: RentalOrderStatus.PENDING,
    });

    return this.rentalOrderRepository.save(order);
  }

  async findOrders(params?: {
    userId?: number;
    campsiteId?: number;
    reservationId?: number;
    status?: RentalOrderStatus;
  }): Promise<RentalOrder[]> {
    const where: any = {};
    if (params?.userId) where.userId = params.userId;
    if (params?.campsiteId) where.campsiteId = params.campsiteId;
    if (params?.reservationId) where.reservationId = params.reservationId;
    if (params?.status) where.status = params.status;

    return this.rentalOrderRepository.find({
      where,
      relations: ['user', 'reservation'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOrder(id: number): Promise<RentalOrder> {
    return this.rentalOrderRepository.findOne({
      where: { id },
      relations: ['user', 'reservation'],
    });
  }

  async pickupOrder(id: number): Promise<RentalOrder> {
    const order = await this.findOrder(id);
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    if (order.status !== RentalOrderStatus.PENDING) {
      throw new HttpException('Order cannot be picked up', HttpStatus.BAD_REQUEST);
    }

    const item = await this.findItem(order.itemId);
    item.availableQuantity -= order.quantity;
    await this.rentalItemRepository.save(item);

    order.status = RentalOrderStatus.RENTED;
    order.pickedUpAt = new Date();
    await this.rentalOrderRepository.save(order);

    return this.findOrder(id);
  }

  async returnOrder(id: number, damageFee?: number): Promise<RentalOrder> {
    const order = await this.findOrder(id);
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    if (order.status !== RentalOrderStatus.RENTED) {
      throw new HttpException('Order is not rented', HttpStatus.BAD_REQUEST);
    }

    const item = await this.findItem(order.itemId);
    item.availableQuantity += order.quantity;
    await this.rentalItemRepository.save(item);

    order.status = damageFee > 0 ? RentalOrderStatus.DAMAGED : RentalOrderStatus.RETURNED;
    order.returnedAt = new Date();
    order.damageFee = damageFee || 0;
    await this.rentalOrderRepository.save(order);

    return this.findOrder(id);
  }

  async cancelOrder(id: number): Promise<RentalOrder> {
    const order = await this.findOrder(id);
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    if (order.status !== RentalOrderStatus.PENDING) {
      throw new HttpException('Order cannot be cancelled', HttpStatus.BAD_REQUEST);
    }

    order.status = RentalOrderStatus.CANCELLED;
    await this.rentalOrderRepository.save(order);

    return this.findOrder(id);
  }
}
