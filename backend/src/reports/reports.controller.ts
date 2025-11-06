import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Roles('Admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({
    summary: 'Reporte general de ventas',
    description: 'Genera un reporte completo de ventas con totales, IVA, promedio y top 10 productos por ingresos'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (ISO 8601). Por defecto: hoy a las 00:00' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (ISO 8601). Por defecto: hoy a las 23:59' })
  @ApiResponse({ status: 200, description: 'Reporte generado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    return this.reportsService.getSalesReport(start, end);
  }

  @Get('sales/daily')
  @ApiOperation({
    summary: 'Reporte de ventas diarias',
    description: 'Genera un reporte agrupado por día con cantidad de ventas y monto total'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (ISO 8601). Por defecto: hace 30 días' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (ISO 8601). Por defecto: hoy' })
  @ApiResponse({ status: 200, description: 'Reporte diario generado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getDailySalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    return this.reportsService.getDailySalesReport(start, end);
  }

  @Get('sales/monthly')
  @ApiOperation({
    summary: 'Reporte de ventas mensuales',
    description: 'Genera un reporte agrupado por mes para un año específico'
  })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Año del reporte. Por defecto: año actual' })
  @ApiResponse({ status: 200, description: 'Reporte mensual generado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getMonthlySalesReport(@Query('year') year?: string) {
    const reportYear = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.reportsService.getMonthlySalesReport(reportYear);
  }

  @Get('sales/yearly')
  @ApiOperation({
    summary: 'Reporte de ventas anuales',
    description: 'Genera un reporte agrupado por año con todos los años disponibles'
  })
  @ApiResponse({ status: 200, description: 'Reporte anual generado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getYearlySalesReport() {
    return this.reportsService.getYearlySalesReport();
  }

  @Get('sales/by-user')
  @ApiOperation({
    summary: 'Reporte de ventas por usuario',
    description: 'Genera un reporte de rendimiento de ventas agrupado por usuario'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (ISO 8601). Por defecto: hace 1 mes' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (ISO 8601). Por defecto: hoy' })
  @ApiResponse({ status: 200, description: 'Reporte por usuario generado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getSalesByUser(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    return this.reportsService.getSalesByUser(start, end);
  }
}
