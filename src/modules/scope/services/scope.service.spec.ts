import { Test, TestingModule } from '@nestjs/testing';
import { ScopeService } from './scope.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Scope } from '../entities/scope.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import { CreateScopeDto } from '../dto/create-scope.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ScopeResponseDto } from '../dto/scope-response.dto';
import { plainToInstance } from 'class-transformer';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

describe('ScopeService', () => {
  let service: ScopeService;
  let repository: jest.Mocked<Repository<Scope>>;

  const mockScope: Scope = {
    id: '123',
    name: 'Example Scope',
    description: 'Example description',
    clients: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    generateUUID: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScopeService,
        {
          provide: getRepositoryToken(Scope),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            findAndCount: jest.fn(),
            softRemove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScopeService>(ScopeService);
    repository = module.get(getRepositoryToken(Scope));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateScopeDto = {
      name: 'Example Scope',
      description: 'Example description',
    };

    it('should create a scope', async () => {
      repository.create.mockReturnValue(mockScope);
      repository.save.mockResolvedValue(mockScope);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockScope);
      expect(result).toEqual(plainToInstance(ScopeResponseDto, mockScope));
    });

    it('should throw an error if repository.save fails', async () => {
      repository.create.mockReturnValue(mockScope);
      repository.save.mockRejectedValue(new Error('Save error'));

      await expect(service.create(createDto)).rejects.toThrow('Save error');
    });
  });

  describe('findAll', () => {
    const paginationDto: PaginationDto = { page: 1, limit: 10 };

    it('should return paginated scopes', async () => {
      repository.findAndCount.mockResolvedValue([[mockScope], 1]);

      const result = await service.findAll(paginationDto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toEqual(
        plainToInstance(ScopeResponseDto, [mockScope]),
      );
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should throw an error if repository.findAndCount fails', async () => {
      repository.findAndCount.mockRejectedValue(new Error('Find error'));

      await expect(service.findAll(paginationDto)).rejects.toThrow(
        'Find error',
      );
    });
  });

  describe('findOne', () => {
    it('should return a scope by id', async () => {
      repository.findOne.mockResolvedValue(mockScope);

      const result = await service.findOne('123');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(result).toEqual(plainToInstance(ScopeResponseDto, mockScope));
    });

    it('should throw NotFoundException if scope not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { description: 'Updated description' };

    it('should update a scope', async () => {
      const updatedScope: Scope = {
        ...mockScope,
        ...updateDto,
        generateUUID: mockScope.generateUUID,
      };

      repository.findOne.mockResolvedValue(mockScope);
      repository.save.mockResolvedValue(updatedScope);

      const result = await service.update('123', updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockScope,
        ...updateDto,
      });
      expect(result).toEqual(plainToInstance(ScopeResponseDto, updatedScope));
    });

    it('should throw NotFoundException if scope not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('123', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a scope', async () => {
      repository.findOne.mockResolvedValue(mockScope);
      repository.softRemove.mockResolvedValue(mockScope);

      await service.delete('123');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(repository.softRemove).toHaveBeenCalledWith(mockScope);
    });

    it('should throw NotFoundException if scope not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.delete('123')).rejects.toThrow(NotFoundException);
    });
  });
});
