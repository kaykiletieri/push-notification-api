import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let reflector: Reflector;

  const validToken = 'valid-token';
  const mockPayload = { clientId: '12345', scopes: ['read', 'write'] };

  const mockExecutionContext = (
    authorizationHeader?: string,
  ): ExecutionContext => {
    const mockRequest = {
      headers: authorizationHeader
        ? { authorization: authorizationHeader }
        : {},
    } as Request & { user?: unknown };
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    jwtService = {
      verify: jest.fn(),
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    reflector = new Reflector();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: jwtService },
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should validate a valid token and attach payload to request.user', () => {
      jwtService.verify.mockReturnValue(mockPayload);

      const context = mockExecutionContext(`Bearer ${validToken}`);
      expect(guard.canActivate(context)).toBe(true);

      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(validToken);
    });

    it('should throw UnauthorizedException if token is missing', () => {
      const context = mockExecutionContext();
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const context = mockExecutionContext(`Bearer invalid-token`);
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(jwtService.verify).toHaveBeenCalledWith('invalid-token');
    });

    it('should throw UnauthorizedException if authorization header is malformed', () => {
      const context = mockExecutionContext('InvalidHeader');
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should log a warning if authorization header is missing', () => {
      const context = mockExecutionContext();
      const loggerSpy = jest.spyOn(guard['logger'], 'warn');

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(loggerSpy).toHaveBeenCalledWith('Token is missing or invalid');
    });

    it('should log an error if token validation fails', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const context = mockExecutionContext(`Bearer invalid-token`);
      const loggerSpy = jest.spyOn(guard['logger'], 'error');

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Token validation failed',
        expect.any(String),
      );
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract a valid token from authorization header', () => {
      const context = mockExecutionContext(`Bearer ${validToken}`);
      const request = context.switchToHttp().getRequest();

      const extractedToken = guard['extractTokenFromHeader'](request);
      expect(extractedToken).toBe(validToken);
    });

    it('should return null if authorization header is missing', () => {
      const context = mockExecutionContext();
      const request = context.switchToHttp().getRequest();

      const extractedToken = guard['extractTokenFromHeader'](request);
      expect(extractedToken).toBeNull();
    });

    it('should return null if authorization header is malformed', () => {
      const context = mockExecutionContext('InvalidHeader');
      const request = context.switchToHttp().getRequest();

      const extractedToken = guard['extractTokenFromHeader'](request);
      expect(extractedToken).toBeNull();
    });
  });
});
