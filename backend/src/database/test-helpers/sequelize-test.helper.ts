import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { UserRole } from '../models/user-role.model';
import { RolePermission } from '../models/role-permission.model';

export async function createTestSequelizeInstance(): Promise<Sequelize> {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    models: [User, Role, Permission, UserRole, RolePermission],
  });

  await sequelize.sync({ force: true });
  return sequelize;
}

export async function closeTestSequelizeInstance(sequelize: Sequelize): Promise<void> {
  await sequelize.close();
}
