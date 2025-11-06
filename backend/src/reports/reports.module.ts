import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { SaleNote } from '../database/models/sale-note.model';
import { SaleNoteDetail } from '../database/models/sale-note-detail.model';
import { Product } from '../database/models/product.model';

@Module({
  imports: [SequelizeModule.forFeature([SaleNote, SaleNoteDetail, Product])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
