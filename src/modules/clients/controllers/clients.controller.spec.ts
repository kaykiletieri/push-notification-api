import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from '../services/clients.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientResponseDto } from '../dto/client-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { NotFoundException } from '@nestjs/common';

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: jest.Mocked<ClientsService>;

  const mockClient: ClientResponseDto = {
    id: '123',
    clientId: 'client-id-123',
    description: 'Example client',
    createdAt: new Date(),
    updatedAt: new Date(),
    scopes: ['scope1', 'scope2'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
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

    controller = module.get<ClientsController>(ClientsController);
    service = module.get(ClientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createV1', () => {
    const createDto: CreateClientDto = {
      clientSecret: 'example-secret',
      description: 'Example description',
    };

    it('should create a client', async () => {
      service.create.mockResolvedValue(mockClient);

      const result = await controller.createV1(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockClient);
    });
  });

  describe('findAllV1', () => {
    const paginationDto: PaginationDto = { page: 1, limit: 10 };
    const mockPaginationResponse = {
      data: [mockClient],
      total: 1,
      page: 1,
      limit: 10,
    };

    it('should return a list of clients with pagination', async () => {
      service.findAll.mockResolvedValue(mockPaginationResponse);

      const result = await controller.findAllV1(paginationDto);

      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(mockPaginationResponse);
    });
  });

  describe('findOneV1', () => {
    it('should return a client by id', async () => {
      service.findOne.mockResolvedValue(mockClient);

      const result = await controller.findOneV1('123');

      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockClient);
    });

    it('should throw NotFoundException if client not found', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOneV1('123')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('updateV1', () => {
    const updateDto: UpdateClientDto = { description: 'Updated description' };

    it('should update a client', async () => {
      service.update.mockResolvedValue(mockClient);

      const result = await controller.updateV1('123', updateDto);

      expect(service.update).toHaveBeenCalledWith('123', updateDto);
      expect(result).toEqual(mockClient);
    });

    it('should throw NotFoundException if client not found', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(controller.updateV1('123', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.update).toHaveBeenCalledWith('123', updateDto);
    });
  });

  describe('deleteV1', () => {
    it('should delete a client', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.deleteV1('123');

      expect(service.delete).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if client not found', async () => {
      service.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteV1('123')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.delete).toHaveBeenCalledWith('123');
    });
  });
});
