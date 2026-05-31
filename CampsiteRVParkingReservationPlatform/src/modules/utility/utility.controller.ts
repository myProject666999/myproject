import { Controller, Get, Post, Put, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { UtilityPole, UtilityUsage } from './utility.entity';

@Controller('utility')
export class UtilityController {
  constructor(private readonly utilityService: UtilityService) {}

  @Get('poles')
  async findPoles(
    @Query('campsiteId') campsiteId: string,
    @Query('spotId') spotId?: string,
  ): Promise<UtilityPole[]> {
    if (!campsiteId) {
      throw new HttpException('campsiteId is required', HttpStatus.BAD_REQUEST);
    }
    return this.utilityService.findPolesByCampsite(
      +campsiteId,
      spotId ? +spotId : undefined,
    );
  }

  @Get('poles/:id')
  async findPole(@Param('id') id: string): Promise<UtilityPole> {
    const pole = await this.utilityService.findPole(+id);
    if (!pole) {
      throw new HttpException('Utility pole not found', HttpStatus.NOT_FOUND);
    }
    return pole;
  }

  @Post('poles')
  async createPole(@Body() poleData: Partial<UtilityPole>): Promise<UtilityPole> {
    return this.utilityService.createPole(poleData);
  }

  @Put('poles/:id')
  async updatePole(
    @Param('id') id: string,
    @Body() updateData: Partial<UtilityPole>,
  ): Promise<UtilityPole> {
    return this.utilityService.updatePole(+id, updateData);
  }

  @Post('usage/start')
  async startUsage(
    @Body('reservationId') reservationId: number,
    @Body('poleId') poleId: number,
  ): Promise<UtilityUsage> {
    if (!reservationId || !poleId) {
      throw new HttpException('reservationId and poleId are required', HttpStatus.BAD_REQUEST);
    }
    return this.utilityService.startUsage(reservationId, poleId);
  }

  @Post('usage/end')
  async endUsage(
    @Body('reservationId') reservationId: number,
    @Body('endElectricReading') endElectricReading: number,
    @Body('endWaterReading') endWaterReading: number,
  ): Promise<UtilityUsage> {
    if (!reservationId || endElectricReading === undefined || endWaterReading === undefined) {
      throw new HttpException('reservationId, endElectricReading and endWaterReading are required', HttpStatus.BAD_REQUEST);
    }
    return this.utilityService.endUsage(reservationId, endElectricReading, endWaterReading);
  }

  @Get('usage/reservation/:reservationId')
  async findUsageByReservation(@Param('reservationId') reservationId: string): Promise<UtilityUsage[]> {
    return this.utilityService.findUsageByReservation(+reservationId);
  }

  @Get('usage/:id/calculate')
  async calculateFee(@Param('id') usageId: string): Promise<any> {
    return this.utilityService.calculateUtilityFee(+usageId);
  }
}
