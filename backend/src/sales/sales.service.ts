import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SaleNote } from '../database/models/sale-note.model';
import { SaleNoteDetail } from '../database/models/sale-note-detail.model';
import { Product } from '../database/models/product.model';
import { User } from '../database/models/user.model';
import { CreateSaleNoteDto } from './dto/create-sale-note.dto';
import { CheckoutSaleNoteDto } from './dto/checkout-sale-note.dto';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(SaleNote)
    private saleNoteModel: typeof SaleNote,
    @InjectModel(SaleNoteDetail)
    private saleNoteDetailModel: typeof SaleNoteDetail,
    @InjectModel(Product)
    private productModel: typeof Product,
    private sequelize: Sequelize,
  ) {}

  async createSaleNote(
    userId: number,
    createSaleNoteDto: CreateSaleNoteDto,
  ): Promise<SaleNote> {
    const transaction = await this.sequelize.transaction();

    try {
      // Validate all products exist and have sufficient stock
      const productIds = createSaleNoteDto.items.map((item) => item.productId);
      const products = await this.productModel.findAll({
        where: { id: productIds },
        transaction,
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException(
          'Uno o más productos no fueron encontrados',
        );
      }

      // Check stock availability
      for (const item of createSaleNoteDto.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new NotFoundException(`Producto ${item.productId} no encontrado`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
          );
        }
      }

      // Calculate total amount
      let totalAmount = 0;
      const saleDetails = createSaleNoteDto.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const unitPrice = item.unitPrice || Number(product.salePrice);
        const totalPrice = unitPrice * item.quantity;
        totalAmount += totalPrice;

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        };
      });

      // Create sale note
      const saleNote = await this.saleNoteModel.create(
        {
          userId,
          paid: false,
          amount: totalAmount,
        },
        { transaction },
      );

      // Create sale note details
      await Promise.all(
        saleDetails.map((detail) =>
          this.saleNoteDetailModel.create(
            {
              ...detail,
              saleNoteId: saleNote.id,
            },
            { transaction },
          ),
        ),
      );

      await transaction.commit();

      // Reload with details
      return this.findOne(saleNote.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    paid?: boolean;
    userId?: number;
  }): Promise<{ sales: SaleNote[]; total: number }> {
    const where: any = {};

    if (options?.paid !== undefined) {
      where.paid = options.paid;
    }

    if (options?.userId) {
      where.userId = options.userId;
    }

    const { rows: sales, count: total } =
      await this.saleNoteModel.findAndCountAll({
        where,
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email'],
          },
          {
            model: SaleNoteDetail,
            include: [
              {
                model: Product,
                attributes: ['id', 'name', 'barcode'],
              },
            ],
          },
        ],
        limit: options?.limit || 50,
        offset: options?.offset || 0,
        order: [['createdAt', 'DESC']],
      });

    return { sales, total };
  }

  async findOne(id: number): Promise<SaleNote> {
    const saleNote = await this.saleNoteModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: SaleNoteDetail,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'barcode', 'salePrice'],
            },
          ],
        },
      ],
    });

    if (!saleNote) {
      throw new NotFoundException(`Nota de venta con ID ${id} no encontrada`);
    }

    return saleNote;
  }

  async checkout(
    id: number,
    checkoutDto: CheckoutSaleNoteDto,
  ): Promise<SaleNote> {
    const transaction = await this.sequelize.transaction();

    try {
      const saleNote = await this.saleNoteModel.findByPk(id, {
        include: [SaleNoteDetail],
        transaction,
      });

      if (!saleNote) {
        throw new NotFoundException(`Nota de venta con ID ${id} no encontrada`);
      }

      if (saleNote.paid) {
        throw new BadRequestException('Esta venta ya fue pagada');
      }

      // Update stock for all products
      for (const detail of saleNote.details) {
        const product = await this.productModel.findByPk(detail.productId, {
          transaction,
        });

        if (!product) {
          throw new NotFoundException(
            `Producto ${detail.productId} no encontrado`,
          );
        }

        if (product.stock < detail.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Requerido: ${detail.quantity}`,
          );
        }

        product.stock -= detail.quantity;
        await product.save({ transaction });
      }

      // Update sale note
      saleNote.paid = true;
      saleNote.comment = checkoutDto.comment || null;
      saleNote.document = checkoutDto.document || null;
      await saleNote.save({ transaction });

      await transaction.commit();

      return this.findOne(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteSaleNote(id: number): Promise<void> {
    const saleNote = await this.saleNoteModel.findByPk(id);

    if (!saleNote) {
      throw new NotFoundException(`Nota de venta con ID ${id} no encontrada`);
    }

    if (saleNote.paid) {
      throw new BadRequestException(
        'No se puede eliminar una venta que ya fue pagada',
      );
    }

    await saleNote.destroy();
  }

  async getPendingSales(): Promise<SaleNote[]> {
    return this.saleNoteModel.findAll({
      where: { paid: false },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: SaleNoteDetail,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'barcode'],
            },
          ],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
  }

  async getSalesCount(paid?: boolean): Promise<number> {
    const where = paid !== undefined ? { paid } : {};
    return this.saleNoteModel.count({ where });
  }

  async getTotalSalesAmount(options?: {
    paid?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    const where: any = {};

    if (options?.paid !== undefined) {
      where.paid = options.paid;
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt[Op.gte] = options.startDate;
      }
      if (options.endDate) {
        where.createdAt[Op.lte] = options.endDate;
      }
    }

    const sales = await this.saleNoteModel.findAll({ where });
    return sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  }
}
