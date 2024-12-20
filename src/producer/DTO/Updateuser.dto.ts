import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'id' })
  @IsString()
  @IsNotEmpty({ message: 'add id ,its mandatory  ' })
  id: string;
  @ApiProperty({ description: 'FirstName' })
  @IsString()
  @IsNotEmpty({ message: 'add FirstName ,its mandatory  ' })
  firstName?: string;
  @ApiProperty({ description: 'LastName' })
  @IsString()
  @IsNotEmpty({ message: 'add lastName ,its mandatory  ' })
  lastName?: string;

  @ApiProperty({ description: 'Date of Birth' })
  @IsDateString({}, { message: 'Invalid Date of Birth format' })
  @IsNotEmpty({ message: 'Date of Birth is mandatory' })
  dob?: string;
}
