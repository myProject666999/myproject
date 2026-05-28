import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ExerciseType as ExerciseTypeType } from '../../shared/types';

interface ExerciseTypeCreationAttributes extends Optional<ExerciseTypeType, 'id'> {}

class ExerciseType extends Model<ExerciseTypeType, ExerciseTypeCreationAttributes> implements ExerciseTypeType {
  public id!: number;
  public name!: string;
  public calories_per_minute!: number;
  public category!: string;
  public description!: string;
}

ExerciseType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    calories_per_minute: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(30),
    },
    description: {
      type: DataTypes.STRING(255),
    },
  },
  {
    sequelize,
    tableName: 'exercise_types',
    timestamps: false,
    underscored: true,
  }
);

export default ExerciseType;
