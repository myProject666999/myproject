import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserGoal as UserGoalType } from '../../shared/types';

interface UserGoalCreationAttributes extends Optional<UserGoalType, 'id' | 'created_at' | 'updated_at' | 'daily_calorie_goal' | 'bmr_formula' | 'activity_multiplier' | 'goal_type'> {}

class UserGoal extends Model<UserGoalType, UserGoalCreationAttributes> implements UserGoalType {
  public id!: number;
  public user_id!: number;
  public daily_calorie_goal!: number;
  public target_weight!: number;
  public bmr_formula!: 'mifflin_st_jeor' | 'harris_benedict';
  public activity_multiplier!: number;
  public goal_type!: 'lose_weight' | 'maintain' | 'gain_weight';
  public readonly created_at!: string;
  public readonly updated_at!: string;
}

UserGoal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    daily_calorie_goal: {
      type: DataTypes.INTEGER,
      defaultValue: 2000,
    },
    target_weight: {
      type: DataTypes.DECIMAL(5, 1),
    },
    bmr_formula: {
      type: DataTypes.ENUM('mifflin_st_jeor', 'harris_benedict'),
      defaultValue: 'mifflin_st_jeor',
    },
    activity_multiplier: {
      type: DataTypes.DECIMAL(4, 2),
      defaultValue: 1.375,
    },
    goal_type: {
      type: DataTypes.ENUM('lose_weight', 'maintain', 'gain_weight'),
      defaultValue: 'maintain',
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
    tableName: 'user_goals',
    timestamps: false,
    underscored: true,
  }
);

export default UserGoal;
