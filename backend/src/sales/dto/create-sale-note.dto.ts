import { IsArray, IsNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SaleItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    minimum: 1,
    type: Number,
  })
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 2000,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateSaleNoteDto {
  @ApiProperty({
    description: 'Lista de productos en la venta',
    type: [SaleItemDto],
    example: [
      { productId: 1, quantity: 2, unitPrice: 2000 },
      { productId: 3, quantity: 1, unitPrice: 1500 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
