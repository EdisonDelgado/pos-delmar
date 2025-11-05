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
import { SalesService } from './sales.service';
import { CreateSaleNoteDto } from './dto/create-sale-note.dto';
import { CheckoutSaleNoteDto } from './dto/checkout-sale-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles('Admin', 'Seller')
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createSaleNoteDto: CreateSaleNoteDto,
  ) {
    return this.salesService.createSaleNote(user.userId, createSaleNoteDto);
  }

  @Get()
  @Roles('Admin', 'Cashier')
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
  getPendingSales() {
    return this.salesService.getPendingSales();
  }

  @Get('stats/count')
  @Roles('Admin')
  getSalesCount(@Query('paid') paid?: string) {
    return this.salesService.getSalesCount(
      paid !== undefined ? paid === 'true' : undefined,
    );
  }

  @Get('stats/total-amount')
  @Roles('Admin')
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }

  @Patch(':id/checkout')
  @Roles('Admin', 'Cashier')
  checkout(
    @Param('id', ParseIntPipe) id: number,
    @Body() checkoutDto: CheckoutSaleNoteDto,
  ) {
    return this.salesService.checkout(id, checkoutDto);
  }

  @Delete(':id')
  @Roles('Admin', 'Seller')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.deleteSaleNote(id);
  }
}
