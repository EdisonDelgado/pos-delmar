import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { UserRole } from '../models/user-role.model';
import { RolePermission } from '../models/role-permission.model';
import { Product } from '../models/product.model';
import { SaleNote } from '../models/sale-note.model';
import { SaleNoteDetail } from '../models/sale-note-detail.model';

export async function createTestSequelizeInstance(): Promise<Sequelize> {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    models: [
      User,
      Role,
      Permission,
      UserRole,
      RolePermission,
      Product,
      SaleNote,
      SaleNoteDetail,
    ],
  });

  await sequelize.sync({ force: true });
  return sequelize;
}

export async function closeTestSequelizeInstance(sequelize: Sequelize): Promise<void> {
  await sequelize.close();
}
