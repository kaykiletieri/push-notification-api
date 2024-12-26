import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client } from '../entities/client.entity';
import { Scope } from '../../scope/entities/scope.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientResponseDto } from '../dto/client-response.dto';
import { plainToInstance } from 'class-transformer';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

describe('ClientsService', () => {
  let service: ClientsService;
  let clientRepository: jest.Mocked<Repository<Client>>;

  const validScopeId = '0e911447-3163-4e79-97f6-dba03a742029';
  const validScope: Scope = {
    id: validScopeId,
    name: 'example-scope',
    description: 'Example scope description',
    createdAt: new Date(),
    updatedAt: new Date(),
    clients: [],
    generateUUID: jest.fn(),
  };

  const mockClient: Client = {
    id: '2f9ce902-8bdf-4c21-9ca0-cbd3f138eeb1',
    clientId: '1dc18cf4-35d8-461f-bd0a-4bb23d2575d8',
    clientSecret: 'example-secret',
    description: 'Example description',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    scopes: [validScope],
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
            manager: {
              getRepository: jest.fn().mockReturnValue({
                findBy: jest.fn(),
              }),
            },
          },
        },
        {
          provide: getRepositoryToken(Scope),
          useValue: {
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    clientRepository = module.get(getRepositoryToken(Client));
  });

  describe('update', () => {
    const updateDto: UpdateClientDto = {
      description: 'Updated description',
      scopeIds: [validScopeId],
    };

    it('should throw NotFoundException if client is not found', async () => {
      clientRepository.findOne.mockResolvedValue(null);

      await expect(service.update(mockClient.id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated clients with scopes', async () => {
      const paginationDto = { page: 1, limit: 10 };
      clientRepository.findAndCount.mockResolvedValue([[mockClient], 1]);

      const result = await service.findAll(paginationDto);

      expect(clientRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
        relations: ['scopes'],
      });
      expect(result.data).toEqual(
        plainToInstance(ClientResponseDto, [mockClient]),
      );
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should return empty data when no clients exist', async () => {
      clientRepository.findAndCount.mockResolvedValue([[], 0]);

      const paginationDto = { page: 1, limit: 10 };
      const result = await service.findAll(paginationDto);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a client by id with scopes', async () => {
      clientRepository.findOne.mockResolvedValue(mockClient);

      const result = await service.findOne('123');

      expect(clientRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['scopes'],
      });
      expect(result).toEqual(plainToInstance(ClientResponseDto, mockClient));
    });

    it('should throw NotFoundException if client is not found', async () => {
      clientRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a client', async () => {
      clientRepository.findOne.mockResolvedValue(mockClient);
      clientRepository.softRemove.mockResolvedValue(mockClient);

      await service.delete('123');

      expect(clientRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(clientRepository.softRemove).toHaveBeenCalledWith(mockClient);
    });

    it('should throw NotFoundException if client is not found', async () => {
      clientRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('123')).rejects.toThrow(NotFoundException);
    });
  });
});
