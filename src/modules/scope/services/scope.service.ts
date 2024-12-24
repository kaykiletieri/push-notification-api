import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Scope } from '../entities/scope.entity';
import { CreateScopeDto } from '../dto/create-scope.dto';
import { ScopeResponseDto } from '../dto/scope-response.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { UpdateScopeDto } from '../dto/update-scope.dto';

@Injectable()
export class ScopeService {
  private readonly logger = new Logger(ScopeService.name);

  constructor(
    @InjectRepository(Scope)
    private readonly scopesRepository: Repository<Scope>,
  ) {}

  async create(data: CreateScopeDto): Promise<ScopeResponseDto> {
    this.logger.log('Creating a new scope');

    try {
      const scope: Scope = this.scopesRepository.create(data);
      const savedScope: Scope = await this.scopesRepository.save(scope);

      return plainToInstance(ScopeResponseDto, savedScope);
    } catch (error) {
      this.logger.error('Error while creating a scope', error.stack);
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: ScopeResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.log('Fetching scopes with pagination');

    const { page, limit } = paginationDto;

    try {
      const [data, total] = await this.scopesRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const transformedData: ScopeResponseDto[] = plainToInstance(
        ScopeResponseDto,
        data,
      );

      this.logger.debug(`Found ${total} scopes, returning page ${page}`);

      return {
        data: transformedData,
        total,
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.logger.error('Database query failed', error.stack);
        throw new Error('Failed to fetch scopes from the database');
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<ScopeResponseDto> {
    this.logger.log(`Fetching scope with ID: ${id}`);

    try {
      const scope: Scope = await this.scopesRepository.findOne({
        where: { id },
      });

      if (!scope) {
        this.logger.warn(`Scope with ID ${id} not found`);
        throw new NotFoundException(`Scope with ID ${id} not found`);
      }

      this.logger.log(`Scope found: ${scope.id}`);

      return plainToInstance(ScopeResponseDto, scope);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.logger.error('Database query failed', error.stack);
        throw new Error('Failed to fetch scope from the database');
      }
      this.logger.error('Unexpected error occurred', error.stack);
      throw error;
    }
  }

  async update(id: string, data: UpdateScopeDto): Promise<ScopeResponseDto> {
    this.logger.log(`Updating scope with ID: ${id}`);

    try {
      const scope: Scope = await this.scopesRepository.findOne({
        where: { id },
      });

      if (!scope) {
        this.logger.warn(`Scope with ID ${id} not found`);
        throw new NotFoundException(`Scope with ID ${id} not found`);
      }

      Object.assign(scope, data);
      const updatedScope: Scope = await this.scopesRepository.save(scope);

      this.logger.log(`Scope updated successfully: ${updatedScope.id}`);

      return plainToInstance(ScopeResponseDto, updatedScope);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.logger.error('Database query failed during update', error.stack);
        throw new Error('Failed to update scope in the database');
      }
      this.logger.error('Unexpected error occurred during update', error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting scope with ID: ${id}`);

    try {
      const scope: Scope = await this.scopesRepository.findOne({
        where: { id },
      });

      if (!scope) {
        this.logger.warn(`Scope with ID ${id} not found`);
        throw new NotFoundException(`Scope with ID ${id} not found`);
      }

      await this.scopesRepository.softRemove(scope);

      this.logger.log(`Scope deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.logger.error('Database query failed during delete', error.stack);
        throw new Error('Failed to delete scope from the database');
      }
      this.logger.error('Unexpected error occurred during delete', error.stack);
      throw error;
    }
  }
}
