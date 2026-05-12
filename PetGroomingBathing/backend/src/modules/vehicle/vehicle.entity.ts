import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('vehicles')
export class Vehicle extends BaseEntity {
  @Column({ length: 50, comment: '车牌号' })
  plateNumber: string;

  @Column({ length: 50, comment: '车型' })
  model: string;

  @Column({ length: 50, nullable: true, comment: '车辆颜色' })
  color: string;

  @Column({ length: 100, nullable: true, name: 'driver_name', comment: '司机姓名' })
  driverName: string;

  @Column({ length: 20, nullable: true, name: 'driver_phone', comment: '司机电话' })
  driverPhone: string;

  @Column({ length: 50, comment: '车辆状态: idle/travelling/maintenance' })
  status: string;

  @Column({ length: 100, nullable: true, name: 'current_location', comment: '当前位置' })
  currentLocation: string;

  @Column({ type: 'int', default: 100, name: 'fuel_level', comment: '油量(%)' })
  fuelLevel: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  notes: string;
}
