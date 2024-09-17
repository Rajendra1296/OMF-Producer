import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Column } from 'typeorm/decorator/columns/Column';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'FirstName' })
  @IsString()
  @IsNotEmpty({ message: 'add FirstName ,its mandatory  ' })
  firstName: string;
  @ApiProperty({ description: 'LastName' })
  @IsString()
  @IsNotEmpty({ message: 'add lastName ,its mandatory  ' })
  lastName: string;
  @ApiProperty({ description: 'Email Address' })
  @IsEmail(
    {},
    {
      message:
        'Invalid email address . Email address should be of name@gmail.com',
    },
  )
  @IsNotEmpty({ message: 'Email Address is mandatory' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Date of Birth' })
  @IsDateString(
    {},
    {
      message:
        'Invalid Date of Birth format , DOB should be of format YYYY-MM-DD . Example:1997-09-19',
    },
  )
  @IsNotEmpty({ message: 'Date of Birth is mandatory' })
  dob: string;
}
