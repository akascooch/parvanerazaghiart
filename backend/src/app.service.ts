import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'parvanerazaghiart-backend',
      phase: '6-public-gallery',
    };
  }
}
