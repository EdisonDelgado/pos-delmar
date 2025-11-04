import { Sequelize } from 'sequelize-typescript';
import { Permission } from '../permission.model';
import {
  createTestSequelizeInstance,
  closeTestSequelizeInstance,
} from '../../test-helpers/sequelize-test.helper';

describe('Permission Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = await createTestSequelizeInstance();
  });

  afterAll(async () => {
    await closeTestSequelizeInstance(sequelize);
  });

  afterEach(async () => {
    await Permission.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should be defined', () => {
    expect(Permission).toBeDefined();
  });

  describe('Model Structure', () => {
    it('should have correct table name', () => {
      expect(Permission.tableName).toBe('permissions');
    });

    it('should have all required columns', () => {
      const attributes = Permission.getAttributes();

      expect(attributes).toHaveProperty('id');
      expect(attributes).toHaveProperty('name');
      expect(attributes).toHaveProperty('resource');
      expect(attributes).toHaveProperty('action');
      expect(attributes).toHaveProperty('description');
      expect(attributes).toHaveProperty('createdAt');
      expect(attributes).toHaveProperty('updatedAt');
    });

    it('should have name field with unique constraint', () => {
      const nameAttribute = Permission.getAttributes()['name'];
      expect(nameAttribute.unique).toBe(true);
    });

    it('should have proper data types', () => {
      const attributes = Permission.getAttributes();

      expect(attributes.id.type.toString()).toContain('INTEGER');
      expect(attributes.name.type.toString()).toContain('VARCHAR');
      expect(attributes.resource.type.toString()).toContain('VARCHAR');
      expect(attributes.action.type.toString()).toContain('VARCHAR');
      expect(attributes.description.type.toString()).toContain('VARCHAR');
    });

    it('should have non-nullable required fields', () => {
      const attributes = Permission.getAttributes();

      expect(attributes.name.allowNull).toBe(false);
      expect(attributes.resource.allowNull).toBe(false);
      expect(attributes.action.allowNull).toBe(false);
    });

    it('should have nullable optional fields', () => {
      const attributes = Permission.getAttributes();

      expect(attributes.description.allowNull).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new permission', async () => {
      const permissionData = {
        name: 'manage_products',
        resource: 'products',
        action: 'manage',
        description: 'Allows managing products',
      };

      const permission = await Permission.create(permissionData);

      expect(permission).toBeDefined();
      expect(permission.id).toBeDefined();
      expect(permission.name).toBe(permissionData.name);
      expect(permission.resource).toBe(permissionData.resource);
      expect(permission.action).toBe(permissionData.action);
      expect(permission.description).toBe(permissionData.description);
      expect(permission.createdAt).toBeDefined();
      expect(permission.updatedAt).toBeDefined();
    });

    it('should find a permission by name', async () => {
      const permissionData = {
        name: 'view_sales',
        resource: 'sales',
        action: 'read',
        description: 'View sales',
      };

      await Permission.create(permissionData);

      const foundPermission = await Permission.findOne({
        where: { name: permissionData.name },
      });

      expect(foundPermission).toBeDefined();
      expect(foundPermission?.name).toBe(permissionData.name);
    });

    it('should find permissions by resource', async () => {
      const permissionsData = [
        {
          name: 'create_products',
          resource: 'products',
          action: 'create',
        },
        {
          name: 'update_products',
          resource: 'products',
          action: 'update',
        },
        {
          name: 'delete_products',
          resource: 'products',
          action: 'delete',
        },
      ];

      for (const permData of permissionsData) {
        await Permission.create(permData);
      }

      const foundPermissions = await Permission.findAll({
        where: { resource: 'products' },
      });

      expect(foundPermissions).toHaveLength(3);
    });

    it('should update a permission', async () => {
      const permissionData = {
        name: 'access_backend',
        resource: 'backend',
        action: 'access',
        description: 'Access backend',
      };

      const permission = await Permission.create(permissionData);

      await permission.update({ description: 'Full backend access' });

      const updatedPermission = await Permission.findByPk(permission.id);
      expect(updatedPermission?.description).toBe('Full backend access');
    });

    it('should delete a permission', async () => {
      const permissionData = {
        name: 'temp_permission',
        resource: 'temp',
        action: 'temp',
      };

      const permission = await Permission.create(permissionData);
      const permissionId = permission.id;

      await permission.destroy();

      const deletedPermission = await Permission.findByPk(permissionId);
      expect(deletedPermission).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should not create a permission without required fields', async () => {
      await expect(
        Permission.create({
          name: 'test_permission',
          // Missing resource and action
        } as any),
      ).rejects.toThrow();
    });

    it('should enforce unique name constraint', async () => {
      const permissionData = {
        name: 'duplicate_permission',
        resource: 'test',
        action: 'test',
      };

      await Permission.create(permissionData);

      // Try to create another permission with same name
      await expect(
        Permission.create({
          name: 'duplicate_permission',
          resource: 'other',
          action: 'other',
        }),
      ).rejects.toThrow();
    });
  });

  describe('Relationships', () => {
    it('should have belongsToMany relationship with Role', () => {
      const associations = Permission.associations;
      expect(associations).toHaveProperty('roles');
    });
  });
});
