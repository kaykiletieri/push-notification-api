import { Test, TestingModule } from '@nestjs/testing';
import { ScopesController } from './scope.controller';
import { ScopeService } from '../services/scope.service';
import { CreateScopeDto } from '../dto/create-scope.dto';
import { UpdateScopeDto } from '../dto/update-scope.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ScopeResponseDto } from '../dto/scope-response.dto';
import { NotFoundException } from '@nestjs/common';

describe('ScopesController', () => {
  let controller: ScopesController;
  let service: jest.Mocked<ScopeService>;

  const mockScopeResponse: ScopeResponseDto = {
    id: '123',
    name: 'Example Scope',
    description: 'Example Description',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScopesController],
      providers: [
        {
          provide: ScopeService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ScopesController>(ScopesController);
    service = module.get(ScopeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createV1', () => {
    const createDto: CreateScopeDto = {
      name: 'New Scope',
      description: 'New Scope Description',
    };

    it('should create a new scope', async () => {
      service.create.mockResolvedValue(mockScopeResponse);

      const result = await controller.createV1(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockScopeResponse);
    });
  });

  describe('findAllV1', () => {
    const paginationDto: PaginationDto = { page: 1, limit: 10 };
    const mockPaginationResponse = {
      data: [mockScopeResponse],
      total: 1,
      page: 1,
      limit: 10,
    };

    it('should return a list of scopes with pagination', async () => {
      service.findAll.mockResolvedValue(mockPaginationResponse);

      const result = await controller.findAllV1(paginationDto);

      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(mockPaginationResponse);
    });
  });

  describe('findOneV1', () => {
    it('should return a scope by ID', async () => {
      service.findOne.mockResolvedValue(mockScopeResponse);

      const result = await controller.findOneV1('123');

      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockScopeResponse);
    });

    it('should throw NotFoundException if scope is not found', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOneV1('123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateV1', () => {
    const updateDto: UpdateScopeDto = { description: 'Updated Description' };

    it('should update a scope by ID', async () => {
      service.update.mockResolvedValue(mockScopeResponse);

      const result = await controller.updateV1('123', updateDto);

      expect(service.update).toHaveBeenCalledWith('123', updateDto);
      expect(result).toEqual(mockScopeResponse);
    });

    it('should throw NotFoundException if scope is not found', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(controller.updateV1('123', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteV1', () => {
    it('should delete a scope by ID', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.deleteV1('123');

      expect(service.delete).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if scope is not found', async () => {
      service.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteV1('123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
