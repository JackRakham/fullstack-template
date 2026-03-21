import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../dtos/user.dto';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import { FirebaseLoginDto } from '../dtos/firebase-login.dto';
import { ConfigKey } from 'src/config/config.keys';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService,
  ) { }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new BusinessLogicException('Invalid credentials', BusinessError.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new BusinessLogicException('Invalid credentials', BusinessError.UNAUTHORIZED);
    }

    const payload = { email: user.email, sub: user.id, user_type: user.user_type };
    const tokens = await this.getTokens(user.id, user.email, user.user_type);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    
    return plainToInstance(AuthResponseDto, {
      ...tokens,
      user: plainToInstance(UserResponseDto, user),
    });
  }

  async loginWithFirebase(dto: FirebaseLoginDto): Promise<AuthResponseDto> {
    try {
      const decodedToken = await this.firebaseService.verifyToken(dto.firebaseToken);
      const { email, name } = decodedToken;

      if (!email) {
        throw new BusinessLogicException('Firebase token missing email', BusinessError.UNAUTHORIZED);
      }

      let user = await this.usersService.findByEmail(email);

      if (!user) {
        this.logger.log(`Creating new user from Firebase: ${email}`);
        // Create user if not exists with a random password
        const randomPassword = Math.random().toString(36).slice(-12);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        await this.usersService.create({
          email,
          name: name || email.split('@')[0],
          password: hashedPassword,
        } as any);
        
        // Re-fetch to get the entity with its ID
        user = await this.usersService.findByEmail(email);
      }

      // Update avatar_url if not set
      if (!user.avatar_url && decodedToken.picture) {
        user.avatar_url = decodedToken.picture;
        await this.usersService.update(user.id, { avatar_url: user.avatar_url } as any);
      }

      const tokens = await this.getTokens(user.id, user.email, user.user_type);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return plainToInstance(AuthResponseDto, {
        ...tokens,
        user: plainToInstance(UserResponseDto, user),
      });
    } catch (error) {
      this.logger.error(`Firebase login failed: ${error.message}`);
      throw new BusinessLogicException(
        error.message || 'Firebase authentication failed',
        BusinessError.UNAUTHORIZED
      );
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    const jwtSecret = this.configService.get<string>(ConfigKey.JWT_SECRET);
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, { secret: jwtSecret });
    } catch {
      throw new UnauthorizedException('Access Denied');
    }
    const userId = payload.sub;

    const user = await this.usersService.findOne(userId);
    // FindbyEmail is used here because findOne might not return hidden fields like hashedRefreshToken, wait, we need it.
    // Actually we need the user with hashedRefreshToken.
    const userWithHash = await this.usersService.findByEmail(user.email);

    if (!userWithHash || !userWithHash.hashed_refresh_token) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      userWithHash.hashed_refresh_token,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.getTokens(userWithHash.id, userWithHash.email, userWithHash.user_type);
    await this.updateRefreshToken(userWithHash.id, tokens.refreshToken);

    return plainToInstance(AuthResponseDto, {
      ...tokens,
      user: plainToInstance(UserResponseDto, userWithHash),
    });
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
  }

  private async getTokens(userId: number, email: string, user_type: string) {
    const jwtSecret = this.configService.get<string>(ConfigKey.JWT_SECRET);
    // Access token - 15m, Refresh token - 7d
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, user_type },
        { secret: jwtSecret, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, user_type },
        { secret: jwtSecret, expiresIn: '7d' },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private hashData(data: string) {
    return bcrypt.hash(data, 10);
  }
}
