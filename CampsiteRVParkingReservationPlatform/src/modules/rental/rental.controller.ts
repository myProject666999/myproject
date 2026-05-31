import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { RentalService } from './rental.service';
import { RentalCategory, RentalItem, RentalOrder } from './rental.entity';

@Controller('rental')
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @Get('categories')
  async findAllCategories(): Promise<RentalCategory[]> {
    return this.rentalService.findAllCategories();
  }

  @Get('items')
  async findItems(
    @Query('campsiteId') campsiteId: string,
    @Query('categoryId') categoryId?: string,
  ): Promise<RentalItem[]> {
    if (!campsiteId) {
      throw new HttpException('campsiteId is required', HttpStatus.BAD_REQUEST);
    }
    return this.rentalService.findItemsByCampsite(
      +campsiteId,
      categoryId ? +categoryId : undefined,
    );
  }

  @Get('items/check-availability')
  async checkAvailability(
    @Query('itemId') itemId: string,
    @Query('quantity') quantity: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<{ available: boolean }> {
    if (!itemId || !quantity || !startDate || !endDate) {
      throw new HttpException('Missing required parameters', HttpStatus.BAD_REQUEST);
    }
    const available = await this.rentalService.checkInventory(
      +itemId,
      +quantity,
      new Date(startDate),
      new Date(endDate),
    );
    return { available };
  }

  @Get('items/:id')
  async findItem(@Param('id') id: string): Promise<RentalItem> {
    const item = await this.rentalService.findItem(+id);
    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }
    return item;
  }

  @Post('items')
  async createItem(@Body() itemData: Partial<RentalItem>): Promise<RentalItem> {
    return this.rentalService.createItem(itemData);
  }

  @Put('items/:id')
  async updateItem(
    @Param('id') id: string,
    @Body() updateData: Partial<RentalItem>,
  ): Promise<RentalItem> {
    return this.rentalService.updateItem(+id, updateData);
  }

  @Post('orders')
  async createOrder(@Body() orderData: Partial<RentalOrder>): Promise<RentalOrder> {
    return this.rentalService.createOrder(orderData);
  }

  @Get('orders')
  async findOrders(
    @Query('userId') userId?: string,
    @Query('campsiteId') campsiteId?: string,
    @Query('reservationId') reservationId?: string,
    @Query('status') status?: string,
  ): Promise<RentalOrder[]> {
    return this.rentalService.findOrders({
      userId: userId ? +userId : undefined,
      campsiteId: campsiteId ? +campsiteId : undefined,
      reservationId: reservationId ? +reservationId : undefined,
      status: status as any,
    });
  }

  @Get('orders/:id')
  async findOrder(@Param('id') id: string): Promise<RentalOrder> {
    const order = await this.rentalService.findOrder(+id);
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  @Put('orders/:id/pickup')
  async pickupOrder(@Param('id') id: string): Promise<RentalOrder> {
    return this.rentalService.pickupOrder(+id);
  }

  @Put('orders/:id/return')
  async returnOrder(
    @Param('id') id: string,
    @Body('damageFee') damageFee?: number,
  ): Promise<RentalOrder> {
    return this.rentalService.returnOrder(+id, damageFee);
  }

  @Put('orders/:id/cancel')
  async cancelOrder(@Param('id') id: string): Promise<RentalOrder> {
    return this.rentalService.cancelOrder(+id);
  }
}
