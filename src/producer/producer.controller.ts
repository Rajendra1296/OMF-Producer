import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './DTO/User.dto';
import { UpdateUserDto } from './DTO/Updateuser.dto';
@ApiTags('producer')
@Controller('producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('CreateUser')
  @ApiOperation({ summary: 'CreateUser and post to sqs' })
  @ApiBody({
    description: 'Message of user details to post on sqs',
    type: CreateUserDto,
  })
  async SendMessage(@Body() createUserDto: CreateUserDto) {
    return this.producerService.sendMessage(createUserDto);
  }
  @Put('update')
  @ApiOperation({ summary: 'Update Status' })
  @ApiBody({
    description: 'Message to post on sqs',
    type: UpdateUserDto,
  })
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.producerService.sendMessageUpdate(updateUserDto);
  }
  @Get('get-user-status')
  @ApiOperation({ summary: 'Get user status and ID by email and DOB' })
  async getUserStatusAndId(
    @Query('email') email: string,
    @Query('dob') dob: string,
  ) {
    return this.producerService.getUserStatusAndId(email, dob);
  }
  @Get('get-user-details')
  @ApiOperation({ summary: 'Get user status and ID by email and DOB' })
  async getUserDetails(@Query('id') id: string) {
    return this.producerService.getUserDetails(id);
  }
}
