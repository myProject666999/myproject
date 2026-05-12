import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  checkInTime?: string;

  @IsDateString()
  @IsOptional()
  checkOutTime?: string;
}
