import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ConsumptionService } from './consumption.service';
import { CreateConsumptionDto } from './dto/create-consumption.dto';
import { UpdateConsumptionDto } from './dto/update-consumption.dto';

@Controller('consumptions')
export class ConsumptionController {
  constructor(private readonly consumptionService: ConsumptionService) {}

  @Post()
  create(@Body() createConsumptionDto: CreateConsumptionDto) {
    return this.consumptionService.create(createConsumptionDto);
  }

  @Get()
  findAll(
    @Query('petId') petId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.consumptionService.findAll(petId, startDate, endDate, paymentMethod);
  }

  @Get('statistics')
  getStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.consumptionService.getStatistics(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumptionService.findOne(id);
  }

  @Get('pet/:petId')
  getByPet(@Param('petId') petId: string) {
    return this.consumptionService.getByPet(petId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConsumptionDto: UpdateConsumptionDto) {
    return this.consumptionService.update(id, updateConsumptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consumptionService.remove(id);
  }
}
