import { IsString, IsNotEmpty, IsEmail, IsIn, IsOptional } from 'class-validator';

export class RequestPasscodeDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  domain!: string;
}

export class VerifyPasscodeDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  domain!: string;
}

export class UpdateOfferStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['ACCEPTED', 'DECLINED'])
  status!: 'ACCEPTED' | 'DECLINED';

  @IsOptional()
  @IsString()
  signature?: string;
}

export class ExtendOfferDto {
  @IsString()
  @IsNotEmpty()
  offerLetter!: string;
}
