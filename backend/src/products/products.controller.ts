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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Crear producto', description: 'Crea un nuevo producto en el inventario' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 409, description: 'El código de barras ya existe' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Roles('Admin', 'Seller', 'Cashier')
  @ApiOperation({ summary: 'Listar productos', description: 'Obtiene todos los productos con paginación y búsqueda' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad de productos a devolver' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Número de productos a saltar' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre o código de barras' })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      search,
    });
  }

  @Get('search')
  @Roles('Admin', 'Seller', 'Cashier')
  @ApiOperation({ summary: 'Buscar productos por nombre', description: 'Busca productos que coincidan con el nombre dado' })
  @ApiQuery({ name: 'name', required: true, type: String, description: 'Nombre del producto a buscar' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad máxima de resultados' })
  @ApiResponse({ status: 200, description: 'Resultados de la búsqueda obtenidos exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  searchByName(@Query('name') name: string, @Query('limit') limit?: string) {
    return this.productsService.searchByName(
      name,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get('barcode/:barcode')
  @Roles('Admin', 'Seller', 'Cashier')
  @ApiOperation({ summary: 'Buscar producto por código de barras', description: 'Busca un producto específico por su código de barras' })
  @ApiResponse({ status: 200, description: 'Producto encontrado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Get('low-stock')
  @Roles('Admin')
  @ApiOperation({ summary: 'Productos con stock bajo', description: 'Obtiene productos con stock por debajo del umbral' })
  @ApiQuery({ name: 'threshold', required: false, type: Number, description: 'Umbral de stock (por defecto: 10)' })
  @ApiResponse({ status: 200, description: 'Lista de productos con stock bajo obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getLowStockProducts(@Query('threshold') threshold?: string) {
    return this.productsService.getLowStockProducts(
      threshold ? parseInt(threshold, 10) : undefined,
    );
  }

  @Get('stats/count')
  @Roles('Admin')
  @ApiOperation({ summary: 'Contar productos', description: 'Obtiene el número total de productos en el inventario' })
  @ApiResponse({ status: 200, description: 'Conteo obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getProductsCount() {
    return this.productsService.getProductsCount();
  }

  @Get('stats/inventory-value')
  @Roles('Admin')
  @ApiOperation({ summary: 'Valor total del inventario', description: 'Calcula el valor total del inventario basado en precios de costo' })
  @ApiResponse({ status: 200, description: 'Valor del inventario obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getTotalInventoryValue() {
    return this.productsService.getTotalInventoryValue();
  }

  @Get(':id')
  @Roles('Admin', 'Seller', 'Cashier')
  @ApiOperation({ summary: 'Obtener producto', description: 'Obtiene un producto por su ID' })
  @ApiResponse({ status: 200, description: 'Producto obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Actualizar producto', description: 'Actualiza los datos de un producto existente' })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 409, description: 'El código de barras ya existe' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @Roles('Admin')
  @ApiOperation({ summary: 'Actualizar stock', description: 'Actualiza la cantidad en stock de un producto' })
  @ApiResponse({ status: 200, description: 'Stock actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Cantidad inválida' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Eliminar producto', description: 'Elimina un producto del inventario' })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
