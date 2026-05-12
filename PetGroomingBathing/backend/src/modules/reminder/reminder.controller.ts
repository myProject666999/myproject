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
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post()
  create(@Body() createReminderDto: CreateReminderDto) {
    return this.reminderService.create(createReminderDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('today') today?: string,
  ) {
    return this.reminderService.findAll(status, type, today === 'true');
  }

  @Get('upcoming')
  findUpcoming(@Query('days') days?: string) {
    return this.reminderService.findUpcoming(days ? parseInt(days, 10) : 7);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reminderService.findOne(id);
  }

  @Get('pet/:petId')
  getByPet(@Param('petId') petId: string) {
    return this.reminderService.getByPet(petId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReminderDto: UpdateReminderDto) {
    return this.reminderService.update(id, updateReminderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reminderService.remove(id);
  }
}
