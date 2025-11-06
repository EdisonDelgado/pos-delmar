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
  tableName: 'settings',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['key'],
      name: 'settings_key_unique_idx',
    },
  ],
})
export class Setting extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Index({
    unique: true,
    name: 'settings_key_unique',
  })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Unique key identifier for the setting',
  })
  declare key: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Value of the setting',
  })
  declare value: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Human-readable name for the setting',
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Description of what this setting controls',
  })
  declare description: string;

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
