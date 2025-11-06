import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from '../products.service';
import { Product } from '../../database/models/product.model';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: typeof Product;

  const mockProduct = {
    id: 1,
    barcode: '123456',
    name: 'Test Product',
    stock: 100,
    costPrice: 10.0,
    salePrice: 15.0,
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
    reload: jest.fn(),
    save: jest.fn(),
    destroy: jest.fn(),
  };

  const mockProductModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get<typeof Product>(getModelToken(Product));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProductDto = {
      barcode: '123456',
      name: 'New Product',
      stock: 50,
      costPrice: 10,
      salePrice: 20,
    };

    it('should create a new product', async () => {
      mockProductModel.findOne.mockResolvedValue(null);
      mockProductModel.create.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(mockProductModel.findOne).toHaveBeenCalledWith({
        where: { barcode: createProductDto.barcode },
      });
      expect(mockProductModel.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(mockProduct);
    });

    it('should throw ConflictException if barcode already exists', async () => {
      mockProductModel.findOne.mockResolvedValue(mockProduct);

      await expect(service.create(createProductDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if salePrice < costPrice', async () => {
      const invalidDto = { ...createProductDto, salePrice: 5, costPrice: 10 };
      mockProductModel.findOne.mockResolvedValue(null);

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [mockProduct, { ...mockProduct, id: 2 }];
      mockProductModel.findAndCountAll.mockResolvedValue({
        rows: mockProducts,
        count: 2,
      });

      const result = await service.findAll({ limit: 50, offset: 0 });

      expect(result).toEqual({
        products: mockProducts,
        total: 2,
      });
      expect(mockProductModel.findAndCountAll).toHaveBeenCalled();
    });

    it('should search products by name or barcode', async () => {
      mockProductModel.findAndCountAll.mockResolvedValue({
        rows: [mockProduct],
        count: 1,
      });

      await service.findAll({ search: 'Test' });

      const callArg = mockProductModel.findAndCountAll.mock.calls[0][0];
      expect(callArg.where).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockProductModel.findByPk.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
      expect(mockProductModel.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByBarcode', () => {
    it('should return a product by barcode', async () => {
      mockProductModel.findOne.mockResolvedValue(mockProduct);

      const result = await service.findByBarcode('123456');

      expect(result).toEqual(mockProduct);
      expect(mockProductModel.findOne).toHaveBeenCalledWith({
        where: { barcode: '123456' },
      });
    });
  });

  describe('searchByName', () => {
    it('should search products by name', async () => {
      mockProductModel.findAll.mockResolvedValue([mockProduct]);

      const result = await service.searchByName('Test', 10);

      expect(result).toEqual([mockProduct]);
      expect(mockProductModel.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated Product' };

    it('should update a product', async () => {
      mockProductModel.findByPk.mockResolvedValue(mockProduct);
      mockProduct.update.mockResolvedValue(mockProduct);
      mockProduct.reload.mockResolvedValue(mockProduct);

      const result = await service.update(1, updateDto);

      expect(mockProduct.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductModel.findByPk.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new barcode already exists', async () => {
      const existingProduct = { ...mockProduct, id: 2 };
      mockProductModel.findByPk.mockResolvedValue(mockProduct);
      mockProductModel.findOne.mockResolvedValue(existingProduct);

      await expect(
        service.update(1, { barcode: 'newbarcode' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if new salePrice < costPrice', async () => {
      mockProductModel.findByPk.mockResolvedValue({
        ...mockProduct,
        costPrice: 10,
        salePrice: 15,
      });

      await expect(
        service.update(1, { salePrice: 5, costPrice: 10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      mockProductModel.findByPk.mockResolvedValue(mockProduct);
      mockProduct.destroy.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockProduct.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      const product = { ...mockProduct, stock: 100, save: jest.fn() };
      mockProductModel.findByPk.mockResolvedValue(product);

      const result = await service.updateStock(1, 50);

      expect(product.stock).toBe(150);
      expect(product.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const product = { ...mockProduct, stock: 10 };
      mockProductModel.findByPk.mockResolvedValue(product);

      await expect(service.updateStock(1, -20)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products with low stock', async () => {
      mockProductModel.findAll.mockResolvedValue([mockProduct]);

      const result = await service.getLowStockProducts(10);

      expect(result).toEqual([mockProduct]);
      expect(mockProductModel.findAll).toHaveBeenCalled();
    });
  });

  describe('getProductsCount', () => {
    it('should return total products count', async () => {
      mockProductModel.count.mockResolvedValue(42);

      const result = await service.getProductsCount();

      expect(result).toBe(42);
    });
  });

  describe('getTotalInventoryValue', () => {
    it('should calculate total inventory value', async () => {
      const products = [
        { ...mockProduct, stock: 10, costPrice: 10, salePrice: 15 },
        { ...mockProduct, id: 2, stock: 20, costPrice: 5, salePrice: 10 },
      ];
      mockProductModel.findAll.mockResolvedValue(products);

      const result = await service.getTotalInventoryValue();

      expect(result).toEqual({
        costValue: 200, // (10*10) + (20*5)
        saleValue: 350, // (10*15) + (20*10)
        potentialProfit: 150,
      });
    });
  });
});
