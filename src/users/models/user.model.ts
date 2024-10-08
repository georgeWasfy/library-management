import { Borrowings } from '@base/borrowings/models/borrowing.model';
import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
  HasMany,
  DefaultScope,
} from 'sequelize-typescript';

@Table({ timestamps: true, tableName: 'users' })

@DefaultScope(() => ({
  attributes: {
    exclude: ['password', 'hashedRt']
  }
}))
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  email: string;

  @Column(DataType.STRING)
  password: string;

  @Column(DataType.STRING)
  hashedRt: string;

  @HasMany(() => Borrowings)
  borrowings: Borrowings[];

  @Column({ type: DataType.BOOLEAN })
  is_active: boolean;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
