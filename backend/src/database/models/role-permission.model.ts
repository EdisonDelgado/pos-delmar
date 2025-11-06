import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  Index,
  CreatedAt,
} from 'sequelize-typescript';
import { Role } from './role.model';
import { Permission } from './permission.model';

@Table({
  tableName: 'role_permissions',
  timestamps: true,
  underscored: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['role_id', 'permission_id'],
      name: 'role_permissions_role_permission_unique_idx',
    },
    {
      fields: ['role_id'],
      name: 'role_permissions_role_id_idx',
    },
    {
      fields: ['permission_id'],
      name: 'role_permissions_permission_id_idx',
    },
  ],
})
export class RolePermission extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Role)
  @Index('role_permissions_role_id_fk')
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Foreign key to roles table',
  })
  declare roleId: number;

  @ForeignKey(() => Permission)
  @Index('role_permissions_permission_id_fk')
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Foreign key to permissions table',
  })
  declare permissionId: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;
}
