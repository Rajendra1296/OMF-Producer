import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './DTO/User.dto';
import { UpdateUserDto } from './DTO/Updateuser.dto';
@ApiTags('producer')
@Controller('producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('CreateUser')
  @ApiOperation({
    summary:
      'CreateUser function which collects details from user and send to SQS',
  })
  @ApiBody({
    description: 'user details to post on sqs',
    type: CreateUserDto,
  })
  async CreateUser(@Body() createUserDto: CreateUserDto) {
    return this.producerService.CreateUser(createUserDto);
  }
  @Put('UpdateUser')
  @ApiOperation({ summary: 'Update the user details' })
  @ApiBody({
    description: 'Message to post on sqs for updating the user',
    type: UpdateUserDto,
  })
  async UpdateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.producerService.UpdateUser(updateUserDto);
  }
  @Get('get-user-status/:email/:dob')
  @ApiOperation({ summary: 'Get user status and ID by email and DOB' })
  async getUserStatusAndId(
    @Param('email') email: string,
    @Param('dob') dob: string,
  ) {
    return this.producerService.getUserStatusAndId(email, dob);
  }
  @Get(`get-user-details/:id`)
  @ApiOperation({ summary: 'Get user status and ID by email and DOB' })
  async getUserDetails(@Param('id') id: string) {
    return this.producerService.getUserDetails(id);
  }
}
