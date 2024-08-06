import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
} from 'sequelize-typescript';

@Table({ timestamps: true, tableName: 'books' })
export class Book extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column(DataType.STRING)
  author: string;

  @Column(DataType.STRING)
  title: string;

  @Column(DataType.STRING)
  shelf_location: string;

  @Column(DataType.NUMBER)
  isbn: number;

  @Column(DataType.NUMBER)
  total_quantity: number;

  @Column(DataType.NUMBER)
  available_quantity: number;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
