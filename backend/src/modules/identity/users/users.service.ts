import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { plainToInstance } from 'class-transformer';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly cacheService: CacheService,
  ) { }

  /**
   * Find all users with pagination
   */
  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { page = 1, page_size = 10 } = pagination;

    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * page_size,
      take: page_size,
      order: { created_at: 'DESC' } as any,
      relations: ['avatar'],
    });

    const items = users.map((user) =>
      plainToInstance(UserResponseDto, user),
    );

    return { items, total };
  }

  /**
   * Find one user by ID
   */
  async findOne(id: number): Promise<UserResponseDto> {
    const cacheKey = `user:${id}`;

    // Try to get from cache
    const cached = await this.cacheService.get<UserEntity>(cacheKey);
    if (cached) {
      return plainToInstance(UserResponseDto, cached);
    }

    // Query DB
    const user = await this.userRepository.findOne({ 
      where: { id } as any,
      relations: ['avatar'],
    });
    if (!user) {
      throw new BusinessLogicException(`User with ID ${id} not found`, BusinessError.NOT_FOUND);
    }

    // Cache for 10 minutes
    await this.cacheService.set(cacheKey, user, CacheTTL.TEN_MINUTES);

    return plainToInstance(UserResponseDto, user);
  }

  /**
   * Create user
   */
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = this.userRepository.create(dto);
    const saved = await this.userRepository.save(user);
    return this.findOne(saved.id);
  }

  /**
   * Update user
   */
  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } as any });
    if (!user) {
      throw new BusinessLogicException(`User with ID ${id} not found`, BusinessError.NOT_FOUND);
    }

    Object.assign(user, dto);
    const updated = await this.userRepository.save(user);

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);

    return this.findOne(updated.id);
  }

  /**
   * Delete user
   */
  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } as any });
    if (!user) {
      throw new BusinessLogicException(`User with ID ${id} not found`, BusinessError.NOT_FOUND);
    }

    await this.userRepository.remove(user);

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);
  }

  /**
   * Find user by email (internal use for auth)
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['avatar'],
      select: ['id', 'email', 'password', 'name', 'hashed_refresh_token', 'avatar_url', 'avatar_id', 'user_type'],
    });
  }

  /**
   * Update Refresh Token hash for a user
   */
  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(userId, {
      hashed_refresh_token: refreshToken,
    });
  }
}
