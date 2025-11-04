import { IsString, IsNumber, IsNotEmpty, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'El código de barras es requerido' })
  @MaxLength(100)
  barcode: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(255)
  name: string;

  @IsNumber()
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @IsNumber()
  @Min(0, { message: 'El precio de costo no puede ser negativo' })
  costPrice: number;

  @IsNumber()
  @Min(0, { message: 'El precio de venta no puede ser negativo' })
  salePrice: number;
}
