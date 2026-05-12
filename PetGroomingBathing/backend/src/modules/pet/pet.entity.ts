import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('pets')
export class Pet extends BaseEntity {
  @Column({ length: 100, comment: '宠物名称' })
  name: string;

  @Column({ length: 50, comment: '品种' })
  breed: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '体重(kg)' })
  weight: number;

  @Column({ length: 20, comment: '性别: male/female' })
  gender: string;

  @Column({ type: 'date', nullable: true, name: 'birth_date', comment: '出生日期' })
  birthDate: string;

  @Column({ length: 500, nullable: true, comment: '性格描述' })
  personality: string;

  @Column({ type: 'text', nullable: true, name: 'allergies', comment: '过敏史' })
  allergies: string;

  @Column({ length: 200, nullable: true, name: 'owner_name', comment: '主人姓名' })
  ownerName: string;

  @Column({ length: 20, nullable: true, name: 'owner_phone', comment: '主人电话' })
  ownerPhone: string;

  @Column({ type: 'text', nullable: true, name: 'vaccination_records', comment: '疫苗接种记录(JSON)' })
  vaccinationRecords: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  notes: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态: 1-正常 0-已删除' })
  status: number;
}
