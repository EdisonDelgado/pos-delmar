import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SaleNote } from '../database/models/sale-note.model';
import { SaleNoteDetail } from '../database/models/sale-note-detail.model';
import { Product } from '../database/models/product.model';

@Module({
  imports: [SequelizeModule.forFeature([SaleNote, SaleNoteDetail, Product])],
  providers: [SalesService],
  controllers: [SalesController],
  exports: [SalesService],
})
export class SalesModule {}
