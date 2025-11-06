import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  Index,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Role } from './role.model';
import { RolePermission } from './role-permission.model';

@Table({
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name'],
      name: 'permissions_name_unique_idx',
    },
    {
      fields: ['resource'],
      name: 'permissions_resource_idx',
    },
    {
      fields: ['action'],
      name: 'permissions_action_idx',
    },
    {
      fields: ['resource', 'action'],
      name: 'permissions_resource_action_idx',
    },
  ],
})
export class Permission extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Index({
    unique: true,
    name: 'permissions_name_unique',
  })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Unique permission name (e.g., access_backend, manage_products)',
  })
  declare name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Resource this permission applies to (e.g., products, sales, users)',
  })
  declare resource: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: 'Action allowed (e.g., create, read, update, delete, list)',
  })
  declare action: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: 'Description of what this permission allows',
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

  // Relationships
  @BelongsToMany(() => Role, () => RolePermission)
  declare roles: Role[];
}
