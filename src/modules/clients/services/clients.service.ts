import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';
import { ClientResponseDto } from '../dto/client-response.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { UpdateClientDto } from '../dto/update-client.dto';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  async create(data: CreateClientDto): Promise<ClientResponseDto> {
    this.logger.log('Creating a new client');

    try {
      const client: Client = this.clientsRepository.create(data);
      const savedClient: Client = await this.clientsRepository.save(client);

      return plainToInstance(ClientResponseDto, savedClient);
    } catch (error) {
      this.logger.error('Error while creating a client', error.stack);
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: ClientResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.log('Fetching clients with pagination');

    const { page, limit } = paginationDto;

    try {
      const [data, total] = await this.clientsRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const transformedData: ClientResponseDto[] = plainToInstance(
        ClientResponseDto,
        data,
      );

      this.logger.debug(`Found ${total} clients, returning page ${page}`);

      return {
        data: transformedData,
        total,
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.logger.error('Database query failed', error.stack);
        throw new Error('Failed to fetch clients from the database');
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<ClientResponseDto> {
    this.logger.log(`Fetching client with ID: ${id}`);

    try {
      const client: Client = await this.clientsRepository.findOne({
        where: { id },
      });

      if (!client) {
        this.logger.warn(`Client with ID ${id} not found`);
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      this.logger.log(`Client found: ${client.id}`);

      return plainToInstance(ClientResponseDto, client);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.logger.error('Database query failed', error.stack);
        throw new Error('Failed to fetch client from the database');
      }
      this.logger.error('Unexpected error occurred', error.stack);
      throw error;
    }
  }

  async update(id: string, data: UpdateClientDto): Promise<ClientResponseDto> {
    this.logger.log(`Updating client with ID: ${id}`);

    try {
      const client: Client = await this.clientsRepository.findOne({
        where: { id },
      });

      if (!client) {
        this.logger.warn(`Client with ID ${id} not found`);
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      Object.assign(client, data);
      const updatedClient: Client = await this.clientsRepository.save(client);

      this.logger.log(`Client updated successfully: ${updatedClient.id}`);

      return plainToInstance(ClientResponseDto, updatedClient);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.logger.error('Database query failed during update', error.stack);
        throw new Error('Failed to update client in the database');
      }
      this.logger.error('Unexpected error occurred during update', error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting client with ID: ${id}`);

    try {
      const client: Client = await this.clientsRepository.findOne({
        where: { id },
      });

      if (!client) {
        this.logger.warn(`Client with ID ${id} not found`);
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      await this.clientsRepository.softRemove(client);

      this.logger.log(`Client deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.logger.error('Database query failed during delete', error.stack);
        throw new Error('Failed to delete client from the database');
      }
      this.logger.error('Unexpected error occurred during delete', error.stack);
      throw error;
    }
  }
}
