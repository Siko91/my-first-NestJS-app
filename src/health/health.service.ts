import { Injectable } from '@nestjs/common';

export type ServerHealthReport = {
  online: boolean;
  connectionReports: { [key: string]: boolean };
  errors: string[];
};

@Injectable()
export class HealthService {
  async getHealth(): Promise<ServerHealthReport> {
    return {
      online: true,
      connectionReports: {
        db: true, // TODO: check if the database can be accessed
      },
      errors: [],
    };
  }
}
