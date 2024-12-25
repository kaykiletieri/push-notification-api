import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client } from '../entities/client.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from '../dto/create-client.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ClientResponseDto } from '../dto/client-response.dto';
import { plainToInstance } from 'class-transformer';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: jest.Mocked<Repository<Client>>;

  const mockClient: Client = {
    id: '123',
    clientId: 'generated-client-id',
    clientSecret: 'example-secret',
    description: 'Example description',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    scopes: [],
    generateUUID: jest.fn(),
    hashClientSecret: jest.fn(),
    validateClientSecret: jest.fn(() => Promise.resolve(true)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
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

    service = module.get<ClientsService>(ClientsService);
    repository = module.get(getRepositoryToken(Client));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateClientDto = {
      clientSecret: 'example-secret',
      description: 'Example description',
      scopeIds: [],
    };

    it('should create a client and generate clientId', async () => {
      repository.create.mockReturnValue(mockClient);
      repository.save.mockResolvedValue(mockClient);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockClient);
      expect(result).toEqual(plainToInstance(ClientResponseDto, mockClient));
    });

    it('should throw an error if repository.save fails', async () => {
      repository.create.mockReturnValue(mockClient);
      repository.save.mockRejectedValue(new Error('Save error'));

      await expect(service.create(createDto)).rejects.toThrow('Save error');
    });
  });

  describe('findAll', () => {
    const paginationDto: PaginationDto = { page: 1, limit: 10 };

    it('should return paginated clients', async () => {
      repository.findAndCount.mockResolvedValue([[mockClient], 1]);

      const result = await service.findAll(paginationDto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toEqual(
        plainToInstance(ClientResponseDto, [mockClient]),
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
    it('should return a client by id', async () => {
      repository.findOne.mockResolvedValue(mockClient);

      const result = await service.findOne('123');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(result).toEqual(plainToInstance(ClientResponseDto, mockClient));
    });

    it('should throw NotFoundException if client not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { description: 'Updated description' };

    it('should update a client', async () => {
      const updatedClient: Client = {
        ...mockClient,
        ...updateDto,
        generateUUID: mockClient.generateUUID,
        hashClientSecret: mockClient.hashClientSecret,
        validateClientSecret: mockClient.validateClientSecret,
      };

      repository.findOne.mockResolvedValue(mockClient);
      repository.save.mockResolvedValue(updatedClient);

      const result = await service.update('123', updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockClient,
        ...updateDto,
      });
      expect(result).toEqual(plainToInstance(ClientResponseDto, updatedClient));
    });

    it('should throw NotFoundException if client not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('123', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a client', async () => {
      repository.findOne.mockResolvedValue(mockClient);
      repository.softRemove.mockResolvedValue(mockClient);

      await service.delete('123');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(repository.softRemove).toHaveBeenCalledWith(mockClient);
    });

    it('should throw NotFoundException if client not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.delete('123')).rejects.toThrow(NotFoundException);
    });
  });
});
