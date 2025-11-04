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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('Admin')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Roles('Admin', 'Seller', 'Cashier')
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
  searchByName(@Query('name') name: string, @Query('limit') limit?: string) {
    return this.productsService.searchByName(
      name,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get('barcode/:barcode')
  @Roles('Admin', 'Seller', 'Cashier')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Get('low-stock')
  @Roles('Admin')
  getLowStockProducts(@Query('threshold') threshold?: string) {
    return this.productsService.getLowStockProducts(
      threshold ? parseInt(threshold, 10) : undefined,
    );
  }

  @Get('stats/count')
  @Roles('Admin')
  getProductsCount() {
    return this.productsService.getProductsCount();
  }

  @Get('stats/inventory-value')
  @Roles('Admin')
  getTotalInventoryValue() {
    return this.productsService.getTotalInventoryValue();
  }

  @Get(':id')
  @Roles('Admin', 'Seller', 'Cashier')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @Roles('Admin')
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
