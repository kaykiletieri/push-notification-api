import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const SCOPES_KEY = 'scopes';
export const Scopes = (...scopes: string[]): CustomDecorator<string> => SetMetadata(SCOPES_KEY, scopes);
