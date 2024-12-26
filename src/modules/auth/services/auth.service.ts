import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Client } from '../../clients/entities/client.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly jwtService: JwtService,
  ) {}

  async validateClient(
    clientId: string,
    clientSecret: string,
  ): Promise<Client> {
    this.logger.log(`Validating client with ID: ${clientId}`);

    try {
      const client = await this.clientRepository.findOne({
        where: { clientId },
        relations: ['scopes'],
      });

      if (!client) {
        this.logger.warn(`Client with ID ${clientId} not found`);
        throw new UnauthorizedException('Invalid client ID or secret');
      }

      const isValidSecret = await client.validateClientSecret(clientSecret);
      if (!isValidSecret) {
        this.logger.warn(`Invalid secret for client ID: ${clientId}`);
        throw new UnauthorizedException('Invalid client ID or secret');
      }

      this.logger.log(`Client validated successfully: ${clientId}`);
      return client;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn('Error during client validation', error.stack);
        throw error;
      }

      this.logger.error('Error during client validation', error.stack);
      throw error;
    }
  }

  async validateScopes(
    client: Client,
    requestedScopes: string[],
  ): Promise<string[]> {
    this.logger.log(
      `Validating requested scopes for client ID: ${client.clientId}`,
    );

    try {
      if (!Array.isArray(requestedScopes)) {
        throw new BadRequestException('Scopes must be an array of strings');
      }

      const assignedScopes = client.scopes.map((scope) => scope.name);

      const validScopes = requestedScopes.filter((scope) =>
        assignedScopes.includes(scope),
      );

      if (validScopes.length !== requestedScopes.length) {
        this.logger.warn(
          `Client ${client.clientId} does not have access to all requested scopes`,
        );
        throw new BadRequestException(
          'Some requested scopes are not valid for this client',
        );
      }

      this.logger.log(
        `Scopes validated successfully for client ID: ${client.clientId}`,
      );
      return validScopes;
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn('Error during scope validation', error.stack);
        throw error;
      }

      this.logger.error('Error during scope validation', error.stack);
      throw error;
    }
  }

  async generateToken(
    client: Client,
    scopes: string[],
    expiration?: string | number,
  ): Promise<{ token: string; scopes: string[]; expiresIn: number }> {
    this.logger.log(
      `Generating token for client ID: ${client.clientId} with scopes: [${scopes.join(
        ', ',
      )}]`,
    );

    try {
      const payload = {
        clientId: client.clientId,
        scopes,
      };

      let expiresIn: number;

      if (expiration) {
        if (typeof expiration === 'string') {
          expiresIn = parseInt(expiration, 10);
          if (isNaN(expiresIn)) {
            throw new Error(
              `"expiresIn" must be a valid number of seconds when using timestamp.`,
            );
          }
        } else if (typeof expiration === 'number') {
          expiresIn = expiration;
        } else {
          throw new Error(`Invalid "expiresIn" value.`);
        }
      } else {
        expiresIn = parseInt(process.env.JWT_EXPIRATION_TIME || '3600', 10);
      }

      const token = this.jwtService.sign(payload, { expiresIn });

      this.logger.log(
        `Token generated successfully for client ID: ${client.clientId} with expiration: ${expiresIn} seconds`,
      );
      return { token, scopes, expiresIn };
    } catch (error) {
      this.logger.error('Error during token generation', error.stack);
      throw error;
    }
  }
}
