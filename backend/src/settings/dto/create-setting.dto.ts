import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty({
    description: 'Unique key identifier',
    example: 'COMPANY_NAME',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key: string;

  @ApiProperty({
    description: 'Setting value',
    example: 'POS Delmar',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: 'Human-readable name',
    example: 'Nombre de la Empresa',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the setting',
    example: 'Nombre de la empresa que aparece en los recibos',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
