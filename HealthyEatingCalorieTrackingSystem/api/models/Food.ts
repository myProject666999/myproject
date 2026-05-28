import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Food as FoodType } from '../../shared/types';

interface FoodCreationAttributes extends Optional<FoodType, 'id' | 'created_at' | 'unit'> {}

class Food extends Model<FoodType, FoodCreationAttributes> implements FoodType {
  public id!: number;
  public name!: string;
  public category!: string;
  public calories_per_100g!: number;
  public protein!: number;
  public fat!: number;
  public carbs!: number;
  public fiber!: number;
  public unit!: string;
  public readonly created_at!: string;
}

Food.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    calories_per_100g: {
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
    fiber: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0,
    },
    unit: {
      type: DataTypes.STRING(20),
      defaultValue: '100g',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'foods',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['category'] },
    ],
  }
);

export default Food;
