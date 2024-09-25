import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { UpdateStatusDto } from './DTO/Updatestatus.dto';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

@Injectable()
export class AdminService {
  private client: DynamoDBClient;
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly logger = new Logger(AdminService.name);
  constructor() {
    this.sqsClient = new SQSClient({ region: process.env.REGION }); // AWS region
    this.queueUrl = process.env.TEST_QUEUE; // AWS SQS URL
    this.client = new DynamoDBClient({ region: 'us-east-1' }); // Replace with your region
  }
  async updateUserStatus(updatestatusDto: UpdateStatusDto) {
    const messageBody = {
      operation: 'updateStatus',
      user: {
        id: updatestatusDto.id,
        status: updatestatusDto.status,
      },
    };
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(messageBody),
    });

    await this.sqsClient.send(command);
    this.logger.log(messageBody);
    return 'User updated successfully';
  }
  async deleteUser(tableName: string, key: Record<string, any>) {
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: marshall(key),
    });
    await this.client.send(command);
    this.logger.log(`id  deleted successfully`);
    return `id  deleted successfully`;
  }
}
