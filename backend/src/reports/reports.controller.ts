import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    return this.reportsService.getSalesReport(start, end);
  }

  @Get('sales/daily')
  getDailySalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    return this.reportsService.getDailySalesReport(start, end);
  }

  @Get('sales/monthly')
  getMonthlySalesReport(@Query('year') year?: string) {
    const reportYear = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.reportsService.getMonthlySalesReport(reportYear);
  }

  @Get('sales/yearly')
  getYearlySalesReport() {
    return this.reportsService.getYearlySalesReport();
  }

  @Get('sales/by-user')
  getSalesByUser(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    return this.reportsService.getSalesByUser(start, end);
  }
}
