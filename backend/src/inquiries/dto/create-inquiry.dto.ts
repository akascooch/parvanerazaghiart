import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  INQUIRY_MAX_CONTACT,
  INQUIRY_MAX_MESSAGE,
  INQUIRY_MAX_NAME,
  INQUIRY_MIN_MESSAGE,
} from '../inquiry.constants';

function trim(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateInquiryDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  @MinLength(2)
  @MaxLength(INQUIRY_MAX_NAME)
  name: string;

  @Transform(({ value }) => trim(value))
  @IsString()
  @MaxLength(INQUIRY_MAX_CONTACT)
  @Matches(/^(?:[^\s@]+@[^\s@]+\.[^\s@]+|0?9\d{9}|\+?\d{8,15})$/, {
    message: 'Provide a valid email or phone number',
  })
  contact: string;

  @Transform(({ value }) => trim(value))
  @IsString()
  @MinLength(INQUIRY_MIN_MESSAGE)
  @MaxLength(INQUIRY_MAX_MESSAGE)
  message: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Artwork reference is invalid',
  })
  artworkSlug?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(80)
  website?: string;
}
