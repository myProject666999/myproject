import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ShareDocumentDto {
  @IsNotEmpty()
  @IsEnum([0, 1, 2], { message: '分享类型必须为 0(私有)/1(链接可读)/2(链接可编辑)' })
  shareType: number;
}
