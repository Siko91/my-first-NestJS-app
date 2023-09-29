import { Controller, Get } from '@nestjs/common';
import { HealthService, ServerHealthReport } from './health.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly appService: HealthService) {}

  @Get()
  async getHealth(): Promise<ServerHealthReport> {
    return this.appService.getHealth();
  }
}
