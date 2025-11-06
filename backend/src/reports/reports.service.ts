import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SaleNote } from '../database/models/sale-note.model';
import { SaleNoteDetail } from '../database/models/sale-note-detail.model';
import { Product } from '../database/models/product.model';
import { User } from '../database/models/user.model';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

export interface SalesReportData {
  totalSales: number;
  totalAmount: number;
  netAmount: number;
  vatAmount: number;
  averageSale: number;
  topProducts: Array<{
    productId: number;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

export interface DailySalesReport {
  date: string;
  sales: number;
  amount: number;
}

@Injectable()
export class ReportsService {
  private readonly VAT_RATE = 0.19; // 19% IVA for Chile

  constructor(
    @InjectModel(SaleNote)
    private saleNoteModel: typeof SaleNote,
    @InjectModel(SaleNoteDetail)
    private saleNoteDetailModel: typeof SaleNoteDetail,
    @InjectModel(Product)
    private productModel: typeof Product,
    private sequelize: Sequelize,
  ) {}

  async getSalesReport(startDate: Date, endDate: Date): Promise<SalesReportData> {
    const sales = await this.saleNoteModel.findAll({
      where: {
        paid: true,
        updatedAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: SaleNoteDetail,
          include: [Product],
        },
      ],
    });

    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const netAmount = totalAmount / (1 + this.VAT_RATE);
    const vatAmount = totalAmount - netAmount;
    const averageSale = totalSales > 0 ? totalAmount / totalSales : 0;

    // Calculate top products
    const productSales: Map<number, { name: string; quantity: number; revenue: number }> = new Map();

    sales.forEach((sale) => {
      sale.details.forEach((detail) => {
        const existing = productSales.get(detail.productId) || {
          name: detail.product.name,
          quantity: 0,
          revenue: 0,
        };

        productSales.set(detail.productId, {
          name: detail.product.name,
          quantity: existing.quantity + detail.quantity,
          revenue: existing.revenue + Number(detail.totalPrice),
        });
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        totalQuantity: data.quantity,
        totalRevenue: Math.round(data.revenue * 100) / 100,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    return {
      totalSales,
      totalAmount: Math.round(totalAmount * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      averageSale: Math.round(averageSale * 100) / 100,
      topProducts,
    };
  }

  async getDailySalesReport(startDate: Date, endDate: Date): Promise<DailySalesReport[]> {
    const sales = await this.saleNoteModel.findAll({
      where: {
        paid: true,
        updatedAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [this.sequelize.fn('DATE', this.sequelize.col('updated_at')), 'date'],
        [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'count'],
        [this.sequelize.fn('SUM', this.sequelize.col('amount')), 'total'],
      ],
      group: [this.sequelize.fn('DATE', this.sequelize.col('updated_at'))],
      order: [[this.sequelize.fn('DATE', this.sequelize.col('updated_at')), 'ASC']],
      raw: true,
    });

    return sales.map((sale: any) => ({
      date: sale.date,
      sales: parseInt(sale.count, 10),
      amount: Math.round(parseFloat(sale.total) * 100) / 100,
    }));
  }

  async getMonthlySalesReport(year: number): Promise<Array<{ month: number; year: number; sales: number; amount: number }>> {
    const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

    const sales = await this.saleNoteModel.findAll({
      where: {
        paid: true,
        updatedAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [this.sequelize.literal("EXTRACT(MONTH FROM updated_at)::INTEGER"), 'month'],
        [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'count'],
        [this.sequelize.fn('SUM', this.sequelize.col('amount')), 'total'],
      ],
      group: ['month'],
      order: [['month', 'ASC']],
      raw: true,
    });

    return sales.map((sale: any) => ({
      month: parseInt(sale.month, 10),
      year: year,
      sales: parseInt(sale.count, 10),
      amount: Math.round(parseFloat(sale.total) * 100) / 100,
    }));
  }

  async getYearlySalesReport(): Promise<Array<{ year: number; sales: number; amount: number }>> {
    const sales = await this.saleNoteModel.findAll({
      where: {
        paid: true,
      },
      attributes: [
        [this.sequelize.literal("EXTRACT(YEAR FROM updated_at)::INTEGER"), 'year'],
        [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'count'],
        [this.sequelize.fn('SUM', this.sequelize.col('amount')), 'total'],
      ],
      group: ['year'],
      order: [['year', 'DESC']],
      raw: true,
    });

    return sales.map((sale: any) => ({
      year: parseInt(sale.year, 10),
      sales: parseInt(sale.count, 10),
      amount: Math.round(parseFloat(sale.total) * 100) / 100,
    }));
  }

  async getSalesByUser(startDate: Date, endDate: Date): Promise<Array<{
    userId: number;
    userName: string;
    totalSales: number;
    totalAmount: number;
  }>> {
    const sales = await this.saleNoteModel.findAll({
      where: {
        paid: true,
        updatedAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
        },
      ],
    });

    const userSales: Map<number, { name: string; count: number; amount: number }> = new Map();

    sales.forEach((sale) => {
      const existing = userSales.get(sale.userId) || {
        name: sale.user.name,
        count: 0,
        amount: 0,
      };

      userSales.set(sale.userId, {
        name: sale.user.name,
        count: existing.count + 1,
        amount: existing.amount + Number(sale.amount),
      });
    });

    return Array.from(userSales.entries())
      .map(([userId, data]) => ({
        userId,
        userName: data.name,
        totalSales: data.count,
        totalAmount: Math.round(data.amount * 100) / 100,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }
}
