import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { MealRecord as MealRecordType } from '../../shared/types';
import Food from './Food';

interface MealRecordCreationAttributes extends Optional<MealRecordType, 'id' | 'created_at' | 'calories' | 'protein' | 'fat' | 'carbs'> {}

class MealRecord extends Model<MealRecordType, MealRecordCreationAttributes> implements MealRecordType {
  public id!: number;
  public user_id!: number;
  public food_id!: number;
  public food?: Food;
  public meal_type!: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  public quantity!: number;
  public calories!: number;
  public protein!: number;
  public fat!: number;
  public carbs!: number;
  public record_date!: string;
  public readonly created_at!: string;
}

MealRecord.init(
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
    food_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    meal_type: {
      type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 100,
    },
    calories: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
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
    tableName: 'meal_records',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id', 'record_date'] },
      { fields: ['user_id', 'meal_type', 'record_date'] },
    ],
  }
);

MealRecord.belongsTo(Food, { foreignKey: 'food_id', as: 'food' });

export default MealRecord;
