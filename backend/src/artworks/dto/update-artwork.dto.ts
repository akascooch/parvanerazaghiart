import { ArtworkStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateArtworkDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(8000)
  description?: string | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return value === undefined ? undefined : null;
    }
    return typeof value === 'number' ? value : Number(value);
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  price?: number | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPriceVisible?: boolean;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(80)
  slug?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null ? null : typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(120)
  technique?: string | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null) {
      return null;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(120)
  collection?: string | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null) {
      return null;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(40)
  categoryId?: string | null;

  @IsOptional()
  @IsEnum(ArtworkStatus)
  status?: ArtworkStatus;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(120)
  medium?: string | null;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(120)
  dimensions?: string | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return value === undefined ? undefined : null;
    }
    return typeof value === 'number' ? value : Number(value);
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(1000)
  @Max(2100)
  year?: number | null;
}
