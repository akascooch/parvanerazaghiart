import { InquiryStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateInquiryDto {
  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;
}
