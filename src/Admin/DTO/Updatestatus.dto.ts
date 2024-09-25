import { IsNotEmpty, IsString } from 'class-validator';

// import { Status } from './Status.model';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ description: 'id' })
  @IsString()
  @IsNotEmpty({ message: 'add id ,its mandatory  ' })
  id: string;
  @ApiProperty({
    description: 'CREATED = created , UPDATED = updated ,BLOCKED = blocked',
  })
  @IsString()
  status: string;
}
