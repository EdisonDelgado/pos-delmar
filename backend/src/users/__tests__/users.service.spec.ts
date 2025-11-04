import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { User } from '../../database/models/user.model';
import { Role } from '../../database/models/role.model';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userModel: typeof User;
  let roleModel: typeof Role;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    $set: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockUserModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRoleModel = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Role),
          useValue: mockRoleModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<typeof User>(getModelToken(User));
    roleModel = module.get<typeof Role>(getModelToken(Role));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(mockUser);
      mockUserModel.findByPk.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create(createUserDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should assign roles if roleIds are provided', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        roleIds: [1, 2],
      };

      const mockRoles = [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' },
      ];

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(mockUser);
      mockRoleModel.findAll.mockResolvedValue(mockRoles);
      mockUserModel.findByPk.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      await service.create(createUserDto);

      expect(mockRoleModel.findAll).toHaveBeenCalledWith({
        where: { id: createUserDto.roleIds },
      });
      expect(mockUser.$set).toHaveBeenCalledWith('roles', mockRoles);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 2 }];
      mockUserModel.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserModel.findAll).toHaveBeenCalledWith({
        include: [{ model: Role, through: { attributes: [] } }],
        attributes: { exclude: ['password'] },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(1, {
        include: [{ model: Role, through: { attributes: [] } }],
        attributes: { exclude: ['password'] },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: [{ model: Role, through: { attributes: [] } }],
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };

      mockUserModel.findByPk
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);

      const result = await service.update(1, updateUserDto);

      expect(mockUser.update).toHaveBeenCalledWith(updateUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should hash password if provided', async () => {
      const updateUserDto = {
        password: 'newPassword',
      };

      mockUserModel.findByPk
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');

      await service.update(1, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    });

    it('should throw ConflictException if email is already taken', async () => {
      const updateUserDto = {
        email: 'existing@example.com',
      };

      const existingUser = { ...mockUser, id: 2, email: 'existing@example.com' };

      mockUserModel.findByPk.mockResolvedValue(mockUser);
      mockUserModel.findOne.mockResolvedValue(existingUser);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockUserModel.findByPk.mockResolvedValue(mockUser);

      await service.remove(1);

      expect(mockUser.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword('password', 'hashedPassword');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword('wrongPassword', 'hashedPassword');

      expect(result).toBe(false);
    });
  });
});
