import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleNoteDto } from './dto/create-sale-note.dto';
import { CheckoutSaleNoteDto } from './dto/checkout-sale-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Sales')
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles('Admin', 'Seller')
  @ApiOperation({ summary: 'Crear nota de venta', description: 'Crea una nueva nota de venta (borrador sin pagar)' })
  @ApiResponse({ status: 201, description: 'Nota de venta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o stock insuficiente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Uno o más productos no encontrados' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createSaleNoteDto: CreateSaleNoteDto,
  ) {
    return this.salesService.createSaleNote(user.userId, createSaleNoteDto);
  }

  @Get()
  @Roles('Admin', 'Cashier')
  @ApiOperation({ summary: 'Listar ventas', description: 'Obtiene todas las ventas con paginación y filtros' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad de ventas a devolver' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Número de ventas a saltar' })
  @ApiQuery({ name: 'paid', required: false, type: Boolean, description: 'Filtrar por estado de pago' })
  @ApiQuery({ name: 'userId', required: false, type: Number, description: 'Filtrar por ID de usuario' })
  @ApiResponse({ status: 200, description: 'Lista de ventas obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('paid') paid?: string,
    @Query('userId') userId?: string,
  ) {
    return this.salesService.findAll({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      paid: paid !== undefined ? paid === 'true' : undefined,
      userId: userId ? parseInt(userId, 10) : undefined,
    });
  }

  @Get('pending')
  @Roles('Admin', 'Cashier')
  @ApiOperation({ summary: 'Ventas pendientes', description: 'Obtiene todas las ventas pendientes de pago' })
  @ApiResponse({ status: 200, description: 'Lista de ventas pendientes obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getPendingSales() {
    return this.salesService.getPendingSales();
  }

  @Get('stats/count')
  @Roles('Admin')
  @ApiOperation({ summary: 'Contar ventas', description: 'Obtiene el número total de ventas' })
  @ApiQuery({ name: 'paid', required: false, type: Boolean, description: 'Filtrar por estado de pago' })
  @ApiResponse({ status: 200, description: 'Conteo obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getSalesCount(@Query('paid') paid?: string) {
    return this.salesService.getSalesCount(
      paid !== undefined ? paid === 'true' : undefined,
    );
  }

  @Get('stats/total-amount')
  @Roles('Admin')
  @ApiOperation({ summary: 'Monto total de ventas', description: 'Calcula el monto total de ventas con filtros opcionales' })
  @ApiQuery({ name: 'paid', required: false, type: Boolean, description: 'Filtrar por estado de pago' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Monto total obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getTotalSalesAmount(
    @Query('paid') paid?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.salesService.getTotalSalesAmount({
      paid: paid !== undefined ? paid === 'true' : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  @Roles('Admin', 'Seller', 'Cashier')
  @ApiOperation({ summary: 'Obtener venta', description: 'Obtiene una venta por su ID' })
  @ApiResponse({ status: 200, description: 'Venta obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }

  @Patch(':id/checkout')
  @Roles('Admin', 'Cashier')
  @ApiOperation({ summary: 'Procesar pago', description: 'Procesa el pago de una venta pendiente y reduce el stock' })
  @ApiResponse({ status: 200, description: 'Pago procesado exitosamente' })
  @ApiResponse({ status: 400, description: 'Venta ya pagada o stock insuficiente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  checkout(
    @Param('id', ParseIntPipe) id: number,
    @Body() checkoutDto: CheckoutSaleNoteDto,
  ) {
    return this.salesService.checkout(id, checkoutDto);
  }

  @Delete(':id')
  @Roles('Admin', 'Seller')
  @ApiOperation({ summary: 'Eliminar venta', description: 'Elimina una venta (solo si no está pagada)' })
  @ApiResponse({ status: 200, description: 'Venta eliminada exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar una venta pagada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.deleteSaleNote(id);
  }
}
