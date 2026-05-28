import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { DailyStat as DailyStatType } from '../../shared/types';

interface DailyStatCreationAttributes extends Optional<DailyStatType, 'id' | 'created_at' | 'updated_at' | 'total_calories_intake' | 'total_calories_burned' | 'calorie_goal' | 'net_calories' | 'protein' | 'fat' | 'carbs'> {}

class DailyStat extends Model<DailyStatType, DailyStatCreationAttributes> implements DailyStatType {
  public id!: number;
  public user_id!: number;
  public stat_date!: string;
  public total_calories_intake!: number;
  public total_calories_burned!: number;
  public calorie_goal!: number;
  public net_calories!: number;
  public protein!: number;
  public fat!: number;
  public carbs!: number;
  public readonly created_at!: string;
  public readonly updated_at!: string;
}

DailyStat.init(
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
    stat_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    total_calories_intake: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_calories_burned: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    calorie_goal: {
      type: DataTypes.INTEGER,
      defaultValue: 2000,
    },
    net_calories: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    protein: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0,
    },
    fat: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0,
    },
    carbs: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'daily_stats',
    timestamps: false,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'stat_date'] },
    ],
  }
);

export default DailyStat;
