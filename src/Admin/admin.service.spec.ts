import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { SQSClient } from '@aws-sdk/client-sqs';
import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

jest.mock('@aws-sdk/client-sqs');
jest.mock('@aws-sdk/client-dynamodb');

describe('AdminService', () => {
  let service: AdminService;
  let sqsClient: SQSClient;
  let dynamoDBClient: DynamoDBClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService],
    }).compile();

    service = module.get<AdminService>(AdminService);
    sqsClient = service['sqsClient'];
    dynamoDBClient = service['client'];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserStatus', () => {
    it('should send a message to SQS and return success message', async () => {
      const updatestatusDto = { id: '123', status: 'active' };
      const messageBody = {
        operation: 'updateStatus',
        user: {
          id: updatestatusDto.id,
          status: updatestatusDto.status,
        },
      };

      (sqsClient.send as jest.Mock).mockResolvedValueOnce({}); // Mocking successful SQS send

      const result = await service.updateUserStatus(updatestatusDto);

      expect(result).toBe('User updated successfully');
      expect(sqsClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          QueueUrl: process.env.TEST_QUEUE,
          MessageBody: JSON.stringify(messageBody),
        }),
      );
    });

    it('should handle errors when sending message to SQS', async () => {
      const updatestatusDto = { id: '123', status: 'active' };
      (sqsClient.send as jest.Mock).mockRejectedValueOnce(
        new Error('SQS error'),
      );

      await expect(service.updateUserStatus(updatestatusDto)).rejects.toThrow(
        'SQS error',
      );
    });
  });

  describe('deleteItem', () => {
    it('should delete an item from DynamoDB and return success message', async () => {
      const tableName = 'testTable';
      const key = { id: '123' };

      (dynamoDBClient.send as jest.Mock).mockResolvedValueOnce({}); // Mocking successful delete

      const result = await service.deleteUser(tableName, key);

      expect(result).toBe('id  deleted successfully');
      expect(dynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(DeleteItemCommand),
      );
    });

    it('should handle errors when deleting an item from DynamoDB', async () => {
      const tableName = 'testTable';
      const key = { id: '123' };
      (dynamoDBClient.send as jest.Mock).mockRejectedValueOnce(
        new Error('DynamoDB error'),
      );

      await expect(service.deleteUser(tableName, key)).rejects.toThrow(
        'DynamoDB error',
      );
    });
  });
});
