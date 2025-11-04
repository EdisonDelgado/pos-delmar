import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from '../database/models/product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Op } from 'sequelize';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if barcode already exists
    const existingProduct = await this.productModel.findOne({
      where: { barcode: createProductDto.barcode },
    });

    if (existingProduct) {
      throw new ConflictException(
        `Producto con código de barras ${createProductDto.barcode} ya existe`,
      );
    }

    // Validate sale price is greater than cost price
    if (createProductDto.salePrice < createProductDto.costPrice) {
      throw new BadRequestException(
        'El precio de venta debe ser mayor o igual al precio de costo',
      );
    }

    return this.productModel.create({
      barcode: createProductDto.barcode,
      name: createProductDto.name,
      stock: createProductDto.stock,
      costPrice: createProductDto.costPrice,
      salePrice: createProductDto.salePrice,
    });
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{ products: Product[]; total: number }> {
    const where: any = {};

    // Search by name or barcode
    if (options?.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${options.search}%` } },
        { barcode: { [Op.iLike]: `%${options.search}%` } },
      ];
    }

    const { rows: products, count: total } =
      await this.productModel.findAndCountAll({
        where,
        limit: options?.limit || 50,
        offset: options?.offset || 0,
        order: [['name', 'ASC']],
      });

    return { products, total };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productModel.findByPk(id);

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    return this.productModel.findOne({
      where: { barcode },
    });
  }

  async searchByName(name: string, limit = 10): Promise<Product[]> {
    return this.productModel.findAll({
      where: {
        name: { [Op.iLike]: `%${name}%` },
      },
      limit,
      order: [['name', 'ASC']],
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Check if barcode is being updated and if it already exists
    if (
      updateProductDto.barcode &&
      updateProductDto.barcode !== product.barcode
    ) {
      const existingProduct = await this.productModel.findOne({
        where: { barcode: updateProductDto.barcode },
      });

      if (existingProduct) {
        throw new ConflictException(
          `Producto con código de barras ${updateProductDto.barcode} ya existe`,
        );
      }
    }

    // Validate sale price is greater than cost price
    const newSalePrice = updateProductDto.salePrice ?? product.salePrice;
    const newCostPrice = updateProductDto.costPrice ?? product.costPrice;

    if (newSalePrice < newCostPrice) {
      throw new BadRequestException(
        'El precio de venta debe ser mayor o igual al precio de costo',
      );
    }

    await product.update(updateProductDto);
    return product.reload();
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await product.destroy();
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await this.findOne(id);

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new BadRequestException(
        `Stock insuficiente. Stock actual: ${product.stock}, cantidad solicitada: ${Math.abs(quantity)}`,
      );
    }

    product.stock = newStock;
    await product.save();

    return product;
  }

  async getLowStockProducts(threshold = 10): Promise<Product[]> {
    return this.productModel.findAll({
      where: {
        stock: { [Op.lte]: threshold },
      },
      order: [['stock', 'ASC']],
    });
  }

  async getProductsCount(): Promise<number> {
    return this.productModel.count();
  }

  async getTotalInventoryValue(): Promise<{
    costValue: number;
    saleValue: number;
    potentialProfit: number;
  }> {
    const products = await this.productModel.findAll();

    const costValue = products.reduce(
      (sum, p) => sum + Number(p.costPrice) * p.stock,
      0,
    );
    const saleValue = products.reduce(
      (sum, p) => sum + Number(p.salePrice) * p.stock,
      0,
    );
    const potentialProfit = saleValue - costValue;

    return {
      costValue: Math.round(costValue * 100) / 100,
      saleValue: Math.round(saleValue * 100) / 100,
      potentialProfit: Math.round(potentialProfit * 100) / 100,
    };
  }
}
