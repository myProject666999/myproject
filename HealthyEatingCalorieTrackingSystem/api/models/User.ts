import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User as UserType } from '../../shared/types';

interface UserModel extends UserType {
  password: string;
}

interface UserCreationAttributes extends Optional<UserModel, 'id' | 'created_at' | 'updated_at' | 'activity_level'> {}

class User extends Model<UserModel, UserCreationAttributes> implements UserModel {
  public id!: number;
  public username!: string;
  public password!: string;
  public email!: string;
  public gender!: 'male' | 'female';
  public age!: number;
  public height!: number;
  public weight!: number;
  public activity_level!: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  public readonly created_at!: string;
  public readonly updated_at!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      defaultValue: 'male',
    },
    age: {
      type: DataTypes.INTEGER,
      defaultValue: 25,
    },
    height: {
      type: DataTypes.DECIMAL(5, 1),
      defaultValue: 170.0,
    },
    weight: {
      type: DataTypes.DECIMAL(5, 1),
      defaultValue: 65.0,
    },
    activity_level: {
      type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
      defaultValue: 'light',
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
    tableName: 'users',
    timestamps: false,
    underscored: true,
  }
);

export default User;
