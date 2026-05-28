import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { WeightRecord as WeightRecordType } from '../../shared/types';

interface WeightRecordCreationAttributes extends Optional<WeightRecordType, 'id' | 'created_at'> {}

class WeightRecord extends Model<WeightRecordType, WeightRecordCreationAttributes> implements WeightRecordType {
  public id!: number;
  public user_id!: number;
  public weight!: number;
  public record_date!: string;
  public readonly created_at!: string;
}

WeightRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: false,
    },
    record_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'weight_records',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id', 'record_date'] },
    ],
  }
);

export default WeightRecord;
