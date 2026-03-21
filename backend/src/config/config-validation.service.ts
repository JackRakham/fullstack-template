import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigValidationService {
  private readonly logger = new Logger(ConfigValidationService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Validates critical configurations.
   * Returns true if valid, false otherwise.
   */
  validateAllConfigs(): boolean {
    const criticalConfigs = [
      'database.host',
      'database.port',
      'database.username',
      'database.password',
      'database.name',
    ];

    let allValid = true;

    criticalConfigs.forEach((key) => {
      const value = this.configService.get(key);
      if (!value) {
        this.logger.error(`Missing critical configuration: ${key}`);
        allValid = false;
      }
    });

    return allValid;
  }
}
