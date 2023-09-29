import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({})
  username: string;

  @ApiProperty({})
  password: string;
}

export class CreateUserDto {
  @ApiProperty({})
  username: string;

  @ApiProperty({})
  password: string;

  @ApiProperty({})
  email: string;

  @ApiProperty({ required: false, nullable: true })
  isAdmin?: boolean;

  @ApiProperty({ required: false, nullable: true })
  fullName?: string;

  @ApiProperty({ required: false, nullable: true })
  phone?: string;

  @ApiProperty({ required: false, nullable: true })
  address?: string;
}

export type JWTUserData = {
  id: number;
  username: string;
  latestAuthId: string;
};
