import { Public, IS_PUBLIC_KEY } from './public.decorator';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  SetMetadata: jest.fn(),
}));

describe('Public Decorator', () => {
  it('should set metadata with IS_PUBLIC_KEY and value true', () => {
    const setMetadataMock = jest.requireMock('@nestjs/common').SetMetadata;

    Public();

    expect(setMetadataMock).toHaveBeenCalledWith(IS_PUBLIC_KEY, true);
  });
});
