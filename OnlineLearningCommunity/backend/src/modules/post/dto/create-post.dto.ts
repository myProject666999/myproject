import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsInt()
  groupId?: number;

  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
