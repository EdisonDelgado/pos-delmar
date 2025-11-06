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
import { User } from './user.model';
import { Permission } from './permission.model';
import { UserRole } from './user-role.model';
import { RolePermission } from './role-permission.model';

@Table({
  tableName: 'roles',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name'],
      name: 'roles_name_unique_idx',
    },
    {
      fields: ['created_at'],
      name: 'roles_created_at_idx',
    },
  ],
})
export class Role extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Index({
    unique: true,
    name: 'roles_name_unique',
  })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Unique role name (e.g., Admin, Seller, Cashier)',
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: 'Description of the role and its purpose',
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
  @BelongsToMany(() => User, () => UserRole)
  declare users: User[];

  @BelongsToMany(() => Permission, () => RolePermission)
  declare permissions: Permission[];
}
