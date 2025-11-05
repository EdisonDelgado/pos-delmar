import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutSaleNoteDto {
  @ApiPropertyOptional({
    description: 'Comentario adicional sobre la venta',
    example: 'Cliente pagó en efectivo',
    maxLength: 1000,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @ApiPropertyOptional({
    description: 'Número de documento (factura, boleta, etc.)',
    example: 'F001-00012345',
    maxLength: 255,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  document?: string;
}
