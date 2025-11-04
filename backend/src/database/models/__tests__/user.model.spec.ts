import { Sequelize } from 'sequelize-typescript';
import { User } from '../user.model';
import { Role } from '../role.model';
import {
  createTestSequelizeInstance,
  closeTestSequelizeInstance,
} from '../../test-helpers/sequelize-test.helper';
import * as bcrypt from 'bcrypt';

describe('User Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = await createTestSequelizeInstance();
  });

  afterAll(async () => {
    await closeTestSequelizeInstance(sequelize);
  });

  afterEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  it('should be defined', () => {
    expect(User).toBeDefined();
  });

  describe('Model Structure', () => {
    it('should have correct table name', () => {
      expect(User.tableName).toBe('users');
    });

    it('should have all required columns', () => {
      const attributes = User.getAttributes();

      expect(attributes).toHaveProperty('id');
      expect(attributes).toHaveProperty('name');
      expect(attributes).toHaveProperty('email');
      expect(attributes).toHaveProperty('password');
      expect(attributes).toHaveProperty('isActive');
      expect(attributes).toHaveProperty('rememberToken');
      expect(attributes).toHaveProperty('createdAt');
      expect(attributes).toHaveProperty('updatedAt');
    });

    it('should have email field with unique constraint', () => {
      const emailAttribute = User.getAttributes()['email'];
      expect(emailAttribute.unique).toBe(true);
    });

    it('should have isActive field with default value true', () => {
      const isActiveAttribute = User.getAttributes()['isActive'];
      expect(isActiveAttribute.defaultValue).toBe(true);
    });

    it('should have proper data types', () => {
      const attributes = User.getAttributes();

      expect(attributes.id.type.toString()).toContain('INTEGER');
      expect(attributes.name.type.toString()).toContain('VARCHAR');
      expect(attributes.email.type.toString()).toContain('VARCHAR');
      expect(attributes.password.type.toString()).toContain('VARCHAR');
    });

    it('should have non-nullable required fields', () => {
      const attributes = User.getAttributes();

      expect(attributes.name.allowNull).toBe(false);
      expect(attributes.email.allowNull).toBe(false);
      expect(attributes.password.allowNull).toBe(false);
      expect(attributes.isActive.allowNull).toBe(false);
    });

    it('should have nullable optional fields', () => {
      const attributes = User.getAttributes();

      expect(attributes.rememberToken.allowNull).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should find a user by email', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      await User.create(userData);

      const foundUser = await User.findOne({
        where: { email: userData.email },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(userData.email);
    });

    it('should update a user', async () => {
      const userData = {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      const user = await User.create(userData);

      await user.update({ name: 'Robert Smith' });

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser?.name).toBe('Robert Smith');
    });

    it('should delete a user', async () => {
      const userData = {
        name: 'Delete Me',
        email: 'delete@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      const user = await User.create(userData);
      const userId = user.id;

      await user.destroy();

      const deletedUser = await User.findByPk(userId);
      expect(deletedUser).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should not create a user without required fields', async () => {
      await expect(
        User.create({
          name: 'Test User',
          // Missing email and password
        } as any),
      ).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        name: 'First User',
        email: 'duplicate@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      await User.create(userData);

      // Try to create another user with same email
      await expect(
        User.create({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: await bcrypt.hash('password456', 10),
        }),
      ).rejects.toThrow();
    });

    it('should have isActive default to true', async () => {
      const userData = {
        name: 'Active User',
        email: 'active@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      const user = await User.create(userData);

      expect(user.isActive).toBe(true);
    });
  });

  describe('Relationships', () => {
    it('should have belongsToMany relationship with Role', () => {
      const associations = User.associations;
      expect(associations).toHaveProperty('roles');
    });
  });
});
