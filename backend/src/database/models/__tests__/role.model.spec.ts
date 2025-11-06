import { Sequelize } from 'sequelize-typescript';
import { Role } from '../role.model';
import {
  createTestSequelizeInstance,
  closeTestSequelizeInstance,
} from '../../test-helpers/sequelize-test.helper';

describe('Role Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = await createTestSequelizeInstance();
  });

  afterAll(async () => {
    await closeTestSequelizeInstance(sequelize);
  });

  afterEach(async () => {
    await Role.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should be defined', () => {
    expect(Role).toBeDefined();
  });

  describe('Model Structure', () => {
    it('should have correct table name', () => {
      expect(Role.tableName).toBe('roles');
    });

    it('should have all required columns', () => {
      const attributes = Role.getAttributes();

      expect(attributes).toHaveProperty('id');
      expect(attributes).toHaveProperty('name');
      expect(attributes).toHaveProperty('description');
      expect(attributes).toHaveProperty('createdAt');
      expect(attributes).toHaveProperty('updatedAt');
    });

    it('should have name field with unique constraint', () => {
      const nameAttribute = Role.getAttributes()['name'];
      expect(nameAttribute.unique).toBe(true);
    });

    it('should have proper data types', () => {
      const attributes = Role.getAttributes();

      expect(attributes.id.type.toString()).toContain('INTEGER');
      expect(attributes.name.type.toString()).toContain('VARCHAR');
      expect(attributes.description.type.toString()).toContain('VARCHAR');
    });

    it('should have non-nullable required fields', () => {
      const attributes = Role.getAttributes();

      expect(attributes.name.allowNull).toBe(false);
    });

    it('should have nullable optional fields', () => {
      const attributes = Role.getAttributes();

      expect(attributes.description.allowNull).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new role', async () => {
      const roleData = {
        name: 'Admin',
        description: 'Administrator with full access',
      };

      const role = await Role.create(roleData);

      expect(role).toBeDefined();
      expect(role.id).toBeDefined();
      expect(role.name).toBe(roleData.name);
      expect(role.description).toBe(roleData.description);
      expect(role.createdAt).toBeDefined();
      expect(role.updatedAt).toBeDefined();
    });

    it('should find a role by name', async () => {
      const roleData = {
        name: 'Seller',
        description: 'Sales person',
      };

      await Role.create(roleData);

      const foundRole = await Role.findOne({
        where: { name: roleData.name },
      });

      expect(foundRole).toBeDefined();
      expect(foundRole?.name).toBe(roleData.name);
    });

    it('should update a role', async () => {
      const roleData = {
        name: 'Cashier',
        description: 'Cashier role',
      };

      const role = await Role.create(roleData);

      await role.update({ description: 'Updated cashier description' });

      const updatedRole = await Role.findByPk(role.id);
      expect(updatedRole?.description).toBe('Updated cashier description');
    });

    it('should delete a role', async () => {
      const roleData = {
        name: 'TempRole',
        description: 'Temporary role',
      };

      const role = await Role.create(roleData);
      const roleId = role.id;

      await role.destroy();

      const deletedRole = await Role.findByPk(roleId);
      expect(deletedRole).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should not create a role without name', async () => {
      await expect(
        Role.create({
          description: 'Test role',
        } as any),
      ).rejects.toThrow();
    });

    it('should enforce unique name constraint', async () => {
      const roleData = {
        name: 'Manager',
        description: 'Manager role',
      };

      await Role.create(roleData);

      // Try to create another role with same name
      await expect(
        Role.create({
          name: 'Manager',
          description: 'Another manager role',
        }),
      ).rejects.toThrow();
    });
  });

  describe('Relationships', () => {
    it('should have belongsToMany relationship with User', () => {
      const associations = Role.associations;
      expect(associations).toHaveProperty('users');
    });

    it('should have belongsToMany relationship with Permission', () => {
      const associations = Role.associations;
      expect(associations).toHaveProperty('permissions');
    });
  });
});
