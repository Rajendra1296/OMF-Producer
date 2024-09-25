import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateStatusDto } from './DTO/Updatestatus.dto';
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Post('update')
  @ApiOperation({ summary: 'Update Status' })
  @ApiBody({
    description: 'Message to post on sqs',
    type: UpdateStatusDto,
  })
  async updateUserStatus(@Body() updateUserDto: UpdateStatusDto) {
    return this.adminService.updateUserStatus(updateUserDto);
  }
  @Delete('delete/:tableName/:id')
  @ApiOperation({ summary: 'Delete an item from DynamoDB' })
  async deleteUser(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
  ) {
    await this.adminService.deleteUser(tableName, { id });
  }
}
