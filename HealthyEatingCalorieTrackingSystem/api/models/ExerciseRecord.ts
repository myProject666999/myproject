import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ExerciseRecord as ExerciseRecordType } from '../../shared/types';

interface ExerciseRecordCreationAttributes extends Optional<ExerciseRecordType, 'id' | 'created_at' | 'calories_burned'> {}

class ExerciseRecord extends Model<ExerciseRecordType, ExerciseRecordCreationAttributes> implements ExerciseRecordType {
  public id!: number;
  public user_id!: number;
  public exercise_type!: string;
  public duration_minutes!: number;
  public calories_burned!: number;
  public record_date!: string;
  public readonly created_at!: string;
}

ExerciseRecord.init(
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
    exercise_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    calories_burned: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
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
    tableName: 'exercise_records',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id', 'record_date'] },
    ],
  }
);

export default ExerciseRecord;
