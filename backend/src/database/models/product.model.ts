import {
  Table,
  Column,
  Model,
  DataType,
  Index,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'products',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['barcode'],
      name: 'products_barcode_unique_idx',
    },
    {
      fields: ['name'],
      name: 'products_name_idx',
    },
    {
      fields: ['stock'],
      name: 'products_stock_idx',
    },
    {
      fields: ['created_at'],
      name: 'products_created_at_idx',
    },
  ],
})
export class Product extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Index({
    unique: true,
    name: 'products_barcode_unique',
  })
  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    unique: true,
    comment: 'Unique barcode for product identification (optional)',
  })
  declare barcode: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Product name',
  })
  declare name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Current stock quantity',
  })
  declare stock: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Cost price (purchase price)',
  })
  declare costPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Sale price (retail price)',
  })
  declare salePrice: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare updatedAt: Date;
}
