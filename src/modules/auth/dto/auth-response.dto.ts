import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
    @ApiProperty({
        description: 'JWT token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    token: string;

    @ApiProperty({
        description: 'Authenticated scopes',
        type: [String],
        example: ['scope:read', 'scope:write'],
    })
    scopes: string[];

    @ApiProperty({
        description: 'Token expiration time in seconds',
        example: 3600,
        type: Number,
    })
    expiresIn: number;
}
