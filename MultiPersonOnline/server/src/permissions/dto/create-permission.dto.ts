import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsInt()
  documentId: number;

  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsEnum([1, 2], { message: '权限类型必须为 1(只读) 或 2(可编辑)' })
  permissionType: number;

  source?: number;
}
