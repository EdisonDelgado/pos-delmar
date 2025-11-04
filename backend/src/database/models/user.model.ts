import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  HasMany,
  Index,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Role } from './role.model';
import { UserRole } from './user-role.model';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['email'],
      name: 'users_email_unique_idx',
    },
    {
      fields: ['name'],
      name: 'users_name_idx',
    },
    {
      fields: ['is_active'],
      name: 'users_is_active_idx',
    },
    {
      fields: ['created_at'],
      name: 'users_created_at_idx',
    },
  ],
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Full name of the user',
  })
  declare name: string;

  @Index({
    unique: true,
    name: 'users_email_unique',
  })
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
    comment: 'Unique email address for authentication',
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Hashed password',
  })
  declare password: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether the user account is active',
  })
  declare isActive: boolean;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: 'Token for password reset',
  })
  declare rememberToken: string;

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
  @BelongsToMany(() => Role, () => UserRole)
  declare roles: Role[];
}
