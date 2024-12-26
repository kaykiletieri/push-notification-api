import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client } from '../entities/client.entity';
import { Scope } from '../../scope/entities/scope.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientResponseDto } from '../dto/client-response.dto';
import { plainToInstance } from 'class-transformer';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

describe('ClientsService', () => {
  let service: ClientsService;
  let clientRepository: jest.Mocked<Repository<Client>>;
  let scopeRepository: jest.Mocked<Repository<Scope>>;

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

  const mockScope: Scope = {
    id: 'scope-id',
    name: 'example-scope',
    description: 'Example scope description',
    createdAt: new Date(),
    updatedAt: new Date(),
    clients: [],
    generateUUID: jest.fn(),
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
    scopeRepository = module.get(getRepositoryToken(Scope));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(clientRepository).toBeDefined();
    expect(scopeRepository).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateClientDto = {
      clientSecret: 'example-secret',
      description: 'Example description',
      scopeIds: ['scope-id'],
    };

    it('should create a client and associate scopes', async () => {
      scopeRepository.findBy.mockResolvedValue([mockScope]);
      clientRepository.create.mockReturnValue(mockClient);
      clientRepository.save.mockResolvedValue(mockClient);

      const result = await service.create(createDto);

      expect(scopeRepository.findBy).toHaveBeenCalledWith({
        id: expect.arrayContaining(createDto.scopeIds),
      });
      expect(clientRepository.create).toHaveBeenCalledWith({
        ...createDto,
        scopes: [mockScope],
      });
      expect(clientRepository.save).toHaveBeenCalledWith(mockClient);
      expect(result).toEqual(plainToInstance(ClientResponseDto, mockClient));
    });

    it('should throw an error if any scope is not found', async () => {
      scopeRepository.findBy.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(scopeRepository.findBy).toHaveBeenCalledWith({
        id: expect.arrayContaining(createDto.scopeIds),
      });
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

  describe('update', () => {
    const updateDto: UpdateClientDto = {
      description: 'Updated description',
      scopeIds: ['scope-id'],
    };

    it('should update a client and associate new scopes', async () => {
      clientRepository.findOne.mockResolvedValue(mockClient);
      scopeRepository.findBy.mockResolvedValue([mockScope]);
      clientRepository.save.mockResolvedValue(mockClient);

      const result = await service.update('123', updateDto);

      expect(clientRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['scopes'],
      });
      expect(scopeRepository.findBy).toHaveBeenCalledWith({
        id: expect.arrayContaining(updateDto.scopeIds),
      });
      expect(clientRepository.save).toHaveBeenCalledWith({
        ...mockClient,
        ...updateDto,
        scopes: [mockScope],
      });
      expect(result).toEqual(plainToInstance(ClientResponseDto, mockClient));
    });

    it('should throw NotFoundException if client is not found', async () => {
      clientRepository.findOne.mockResolvedValue(null);

      await expect(service.update('123', updateDto)).rejects.toThrow(
        NotFoundException,
      );
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
