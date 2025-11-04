import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Product } from './product.model';
import { SaleNote } from './sale-note.model';

@Table({
  tableName: 'sale_note_details',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['product_id'],
      name: 'sale_note_details_product_id_idx',
    },
    {
      fields: ['sale_note_id'],
      name: 'sale_note_details_sale_note_id_idx',
    },
    {
      fields: ['created_at'],
      name: 'sale_note_details_created_at_idx',
    },
  ],
})
export class SaleNoteDetail extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Product)
  @Index('sale_note_details_product_id_fk')
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Product sold',
  })
  declare productId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Unit price at time of sale',
  })
  declare unitPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total price for this item (unitPrice * quantity)',
  })
  declare totalPrice: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Quantity sold',
  })
  declare quantity: number;

  @ForeignKey(() => SaleNote)
  @Index('sale_note_details_sale_note_id_fk')
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Sale note this detail belongs to',
  })
  declare saleNoteId: number;

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

  // Relationships
  @BelongsTo(() => Product)
  declare product: Product;

  @BelongsTo(() => SaleNote)
  declare saleNote: SaleNote;
}
