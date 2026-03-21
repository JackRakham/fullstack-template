import { Module, Logger } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import configuration from './configuration';
import { ConfigValidationService } from './config-validation.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationOptions: {
        abortEarly: false,
      },
      envFilePath: [`.env.${process.env.NODE_ENV}.local`, '.env'],
    }),
  ],
  providers: [ConfigValidationService],
  exports: [ConfigValidationService],
})
export class ConfigModule {
  private readonly logger = new Logger(ConfigModule.name);

  constructor(private readonly configValidationService: ConfigValidationService) {
    // Check which .env files exist and log them
    const nodeEnv = process.env.NODE_ENV || 'development';
    const envFiles = [`.env.${nodeEnv}.local`, '.env'];

    this.logger.log(`Environment: ${nodeEnv}`);
    this.logger.log('Checking for .env files:');

    envFiles.forEach((file) => {
      const filePath = path.resolve(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.logger.log(`✅ Found ${file}`);
      } else {
        this.logger.warn(`❌ Not found ${file}`);
      }
    });

    // Validate critical configurations
    this.logger.log('=== Configuration Validation ===');
    const isValid = this.configValidationService.validateAllConfigs();
    
    if (!isValid) {
      this.logger.error('❌ Critical configuration errors found. Please check your environment variables.');
      this.logger.error('Application may not work correctly without proper configuration.');
    } else {
      this.logger.log('✅ All critical configurations are valid');
    }
  }
}
