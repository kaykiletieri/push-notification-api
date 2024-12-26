import {
  Controller,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Version,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthRequestDto } from '../dto/auth-request.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate JWT for a client' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: AuthRequestDto,
    description: 'Client credentials and requested scopes',
  })
  @ApiQuery({
    name: 'expiration',
    type: Number,
    required: false,
    description: 'Custom expiration time in seconds (e.g., 3600 = 1 hour)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'JWT generated successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
  })
  async generateTokenV1(
    @Body() authRequestDto: AuthRequestDto,
    @Query('expiration') expiration?: number,
  ): Promise<AuthResponseDto> {
    const { grant_type, clientId, clientSecret, scopes } = authRequestDto;

    this.logger.debug(
      `Received authentication request for clientId: ${clientId}`,
    );

    if (grant_type !== 'client_credentials') {
      throw new BadRequestException(
        'Invalid grant_type. Expected "client_credentials".',
      );
    }

    const normalizedScopes = scopes.split(',').map((scope) => scope.trim());

    const client = await this.authService.validateClient(
      clientId,
      clientSecret,
    );
    const validScopes = await this.authService.validateScopes(
      client,
      normalizedScopes,
    );
    const { token, expiresIn } = await this.authService.generateToken(
      client,
      validScopes,
      expiration,
    );

    return {
      token,
      scopes: validScopes,
      expiresIn,
    };
  }
}
