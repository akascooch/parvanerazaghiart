import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminInquiriesController } from './admin-inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { InquiryRateLimitService } from './inquiry-rate-limit.service';
import { PublicInquiriesController } from './public-inquiries.controller';

@Module({
  imports: [AuthModule],
  controllers: [PublicInquiriesController, AdminInquiriesController],
  providers: [InquiriesService, InquiryRateLimitService],
})
export class InquiriesModule {}
