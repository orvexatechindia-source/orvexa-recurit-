import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['FREE', 'PRO', 'ENTERPRISE'])
  plan!: string;
}

export class UpdateCountryDto {
  @IsString()
  @IsNotEmpty()
  country!: string;
}
