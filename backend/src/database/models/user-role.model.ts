import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  Index,
  CreatedAt,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Role } from './role.model';

@Table({
  tableName: 'user_roles',
  timestamps: true,
  underscored: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'role_id'],
      name: 'user_roles_user_role_unique_idx',
    },
    {
      fields: ['user_id'],
      name: 'user_roles_user_id_idx',
    },
    {
      fields: ['role_id'],
      name: 'user_roles_role_id_idx',
    },
  ],
})
export class UserRole extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Index('user_roles_user_id_fk')
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Foreign key to users table',
  })
  declare userId: number;

  @ForeignKey(() => Role)
  @Index('user_roles_role_id_fk')
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Foreign key to roles table',
  })
  declare roleId: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;
}
