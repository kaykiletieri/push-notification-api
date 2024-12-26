import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ScopeService } from '../services/scope.service';
import { CreateScopeDto } from '../dto/create-scope.dto';
import { UpdateScopeDto } from '../dto/update-scope.dto';
import { ScopeResponseDto } from '../dto/scope-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiTags('Scopes')
@Controller('scope')
export class ScopesController {
  constructor(private readonly scopeService: ScopeService) {}

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new scope' })
  @ApiBody({
    type: CreateScopeDto,
    description: 'Scope data',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Scope created successfully',
    type: ScopeResponseDto,
  })
  async createV1(
    @Body() createScopeDto: CreateScopeDto,
  ): Promise<ScopeResponseDto> {
    return this.scopeService.create(createScopeDto);
  }

  @Get()
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all scopes with pagination' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of scopes',
    type: [ScopeResponseDto],
  })
  async findAllV1(@Query() paginationDto: PaginationDto): Promise<{
    data: ScopeResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.scopeService.findAll(paginationDto);
  }

  @Get(':id')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a scope by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Scope details',
    type: ScopeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Scope not found',
  })
  async findOneV1(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ScopeResponseDto> {
    return this.scopeService.findOne(id);
  }

  @Patch(':id')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a scope by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Scope updated successfully',
    type: ScopeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Scope not found',
  })
  async updateV1(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateScopeDto: UpdateScopeDto,
  ): Promise<ScopeResponseDto> {
    return this.scopeService.update(id, updateScopeDto);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a scope by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Scope deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Scope not found',
  })
  async deleteV1(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.scopeService.delete(id);
  }
}
