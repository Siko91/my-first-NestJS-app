import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false, nullable: true })
  username?: string;

  @ApiProperty({ required: false, nullable: true })
  email?: string;

  @ApiProperty({ required: false, nullable: true })
  isAdmin?: boolean;

  @ApiProperty({ required: false, nullable: true })
  fullName?: string;

  @ApiProperty({ required: false, nullable: true })
  phone?: string;

  @ApiProperty({ required: false, nullable: true })
  address?: string;
}
