import { IsOptional, IsEnum } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsEnum([1, 2])
  permissionType?: number;
}
