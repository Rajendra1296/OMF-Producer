import { ProducerService } from './producer.service';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import axios from 'axios';

jest.mock('@aws-sdk/client-sqs');
jest.mock('axios');

describe('ProducerService', () => {
  let producerService: ProducerService;

  beforeEach(() => {
    producerService = new ProducerService();
    process.env.REGION = 'us-east-1';
    process.env.TEST_QUEUE =
      'https://sqs.us-east-1.amazonaws.com/484907524104/TASKOMF';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    const mockUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      dob: '2000-01-01',
    };
    // const MessageBody = {
    //   firstName: 'John',
    //   lastName: 'Doe',
    //   email: 'john.doe@example.com',
    //   dob: '2000-01-01',
    // };

    it('should create a user and send a message to SQS when user does not exist', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: 'User not found',
      });

      const sendMessageMock = jest.fn();
      (SQSClient.prototype.send as jest.Mock).mockImplementation(
        sendMessageMock,
      );

      const result = await producerService.sendMessage(mockUserDto);

      expect(result).toEqual('User John have been created an account');

      expect(sendMessageMock).toHaveBeenCalledTimes(1);

      const command = sendMessageMock.mock.calls[0][0];
      expect(command).toBeInstanceOf(SendMessageCommand);
      expect(command.input.MessageBody).toEqual(
        JSON.stringify({
          operation: 'create',
          user: mockUserDto,
        }),
      );
    });

    it('should return a message if the user already exists', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: 'User exists' });

      const result = await producerService.sendMessage(mockUserDto);

      expect(result).toEqual(
        'User already exists plz check your id through getID or There is a user with the email that has been entered plz try wit h different mail',
      );
      expect(SQSClient.prototype.send).not.toHaveBeenCalled();
    });
  });

  describe('sendMessageUpdate', () => {
    const mockUpdateUserDto = {
      id: '123',
      firstName: 'Jane',
      lastName: 'Doe',
      dob: '1999-01-01',
    };

    it('should update a user and send a message to SQS when the user is not blocked', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: { user: { status: { S: 'active' } } },
      });

      const sendMessageMock = jest.fn();
      (SQSClient.prototype.send as jest.Mock).mockImplementation(
        sendMessageMock,
      );

      const result = await producerService.sendMessageUpdate(mockUpdateUserDto);

      expect(result).toEqual('User updated successfully');
      expect(sendMessageMock).toHaveBeenCalledTimes(1);
      const command = sendMessageMock.mock.calls[0][0];
      expect(command).toBeInstanceOf(SendMessageCommand);
    });

    it('should return a warning if the user is blocked', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: { user: { status: { S: 'blocked' } } },
      });

      const result = await producerService.sendMessageUpdate(mockUpdateUserDto);

      expect(result).toEqual(
        'User is blocked contact admin for activating the user',
      );
      expect(SQSClient.prototype.send).not.toHaveBeenCalled();
    });
  });
});
