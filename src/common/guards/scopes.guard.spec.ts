import { Test, TestingModule } from '@nestjs/testing';
import { ScopesGuard } from './scopes.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

describe('ScopesGuard', () => {
  let guard: ScopesGuard;
  let reflector: Reflector;

  const mockExecutionContext = (
    userScopes: string[] | null = null,
    requiredScopes: string[] | null = null,
  ): ExecutionContext => {
    const mockRequest: Partial<Request & { user?: { scopes: string[] } }> = {
      user: userScopes ? { scopes: userScopes } : undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    reflector = new Reflector();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScopesGuard,
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    guard = module.get<ScopesGuard>(ScopesGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should deny access if user has no scopes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read']);

      const context = mockExecutionContext([]);
      const loggerSpy = jest.spyOn(guard['logger'], 'warn');

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(loggerSpy).toHaveBeenCalledWith('User lacks required scopes: [read]');
    });

    it('should log a warning and deny access if user lacks required scopes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const context = mockExecutionContext(['read']);
      const loggerSpy = jest.spyOn(guard['logger'], 'warn');

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(loggerSpy).toHaveBeenCalledWith('User lacks required scopes: [admin]');
    });

    it('should log and deny access if required scopes are partially missing', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read', 'admin']);

      const context = mockExecutionContext(['read']);
      const loggerSpy = jest.spyOn(guard['logger'], 'warn');

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(loggerSpy).toHaveBeenCalledWith('User lacks required scopes: [admin]');
    });

    it('should allow access if no required scopes are set', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const context = mockExecutionContext(['read', 'write']);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access if user has all required scopes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read', 'write']);

      const context = mockExecutionContext(['read', 'write', 'delete']);
      const loggerSpy = jest.spyOn(guard['logger'], 'log');

      expect(guard.canActivate(context)).toBe(true);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Access granted for user with scopes: [read, write, delete]`,
      );
    });

    it('should deny access if user is not authenticated', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read']);

      const context = mockExecutionContext(null);
      const loggerSpy = jest.spyOn(guard['logger'], 'warn');

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(loggerSpy).toHaveBeenCalledWith('User does not have the required scopes');
    });
  });
});
