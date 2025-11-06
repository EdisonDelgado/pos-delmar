import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Index,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './user.model';
import { SaleNoteDetail } from './sale-note-detail.model';

@Table({
  tableName: 'sale_notes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id'],
      name: 'sale_notes_user_id_idx',
    },
    {
      fields: ['paid'],
      name: 'sale_notes_paid_idx',
    },
    {
      fields: ['created_at'],
      name: 'sale_notes_created_at_idx',
    },
    {
      fields: ['updated_at'],
      name: 'sale_notes_updated_at_idx',
    },
  ],
})
export class SaleNote extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Sale note ID starting from 1000',
  })
  declare id: number;

  @ForeignKey(() => User)
  @Index('sale_notes_user_id_fk')
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'User who created the sale',
  })
  declare userId: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Payment status',
  })
  declare paid: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Additional comments',
  })
  declare comment: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: 'Payment document reference',
  })
  declare document: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total sale amount',
  })
  declare amount: number;

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
  @BelongsTo(() => User)
  declare user: User;

  @HasMany(() => SaleNoteDetail, {
    onDelete: 'CASCADE',
  })
  declare details: SaleNoteDetail[];
}
