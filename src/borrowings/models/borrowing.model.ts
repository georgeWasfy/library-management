import { Book } from '@base/books/models/book.model';
import { User } from '@base/users/models/user.model';
import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

@Table({ timestamps: true, tableName: 'borrowings' })
export class Borrowings extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Book)
  @Column(DataType.INTEGER)
  book_id: number;

  @BelongsTo(() => Book)
  book: Book;

  @Column({ type: DataType.BOOLEAN })
  is_returned: boolean;

  @Column(DataType.DATE)
  due_date: Date;

  @Column(DataType.DATE)
  return_date: Date;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
