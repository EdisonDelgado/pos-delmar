import { IsString, IsNumber, IsNotEmpty, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Código de barras único del producto',
    example: '7501234567890',
    maxLength: 100,
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'El código de barras es requerido' })
  @MaxLength(100)
  barcode: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Coca Cola 2L',
    maxLength: 255,
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Cantidad en stock del producto',
    example: 100,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @ApiProperty({
    description: 'Precio de costo del producto',
    example: 1500,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @Min(0, { message: 'El precio de costo no puede ser negativo' })
  costPrice: number;

  @ApiProperty({
    description: 'Precio de venta del producto',
    example: 2000,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @Min(0, { message: 'El precio de venta no puede ser negativo' })
  salePrice: number;
}
