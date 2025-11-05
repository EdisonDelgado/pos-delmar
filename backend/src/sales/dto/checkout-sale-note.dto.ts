import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CheckoutSaleNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  document?: string;
}
