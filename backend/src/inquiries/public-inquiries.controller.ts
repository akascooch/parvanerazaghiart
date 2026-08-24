import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiriesService } from './inquiries.service';

@Controller('public/inquiries')
export class PublicInquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Post()
  create(@Body() dto: CreateInquiryDto, @Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0]?.trim()
        : req.ip || req.socket.remoteAddress;
    return this.inquiries.create(dto, {
      ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
