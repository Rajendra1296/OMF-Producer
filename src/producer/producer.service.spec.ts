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
      firstName: 'Johfn',
      lastName: 'Ddgoe',
      email: 'johdgn.doe@example.com',
      dob: '2000-01-01',
    };

    it('should create a user and send a message to SQS when user does not exist', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: 'User not found',
      });

      const sendMessageMock = jest.fn();
      (SQSClient.prototype.send as jest.Mock).mockImplementation(
        sendMessageMock,
      );

      const result = await producerService.CreateUser(mockUserDto);

      expect(result).toEqual(
        'An User already exists with the mail  johdgn.doe@example.com plz check your details through getID orelse  plz try with different mail',
      );

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

      const result = await producerService.CreateUser(mockUserDto);

      expect(result).toEqual(
        'An User already exists with the mail  johdgn.doe@example.com plz check your details through getID orelse  plz try with different mail',
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

      const result = await producerService.UpdateUser(mockUpdateUserDto);

      expect(result).toEqual('User Jane have been update successfully');
      expect(sendMessageMock).toHaveBeenCalledTimes(1);
      const command = sendMessageMock.mock.calls[0][0];
      expect(command).toBeInstanceOf(SendMessageCommand);
    });

    it('should return a warning if the user is blocked', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: { user: { status: { S: 'blocked' } } },
      });

      const result = await producerService.UpdateUser(mockUpdateUserDto);

      expect(result).toEqual(
        ' undefined is blocked and cannot be updated , contact admin for activating the user',
      );
      expect(SQSClient.prototype.send).not.toHaveBeenCalled();
    });
  });
});
