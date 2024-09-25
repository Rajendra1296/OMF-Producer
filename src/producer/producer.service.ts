import { Injectable, Logger } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CreateUserDto } from './DTO/User.dto';
import { UpdateUserDto } from './DTO/Updateuser.dto';
import axios from 'axios';

@Injectable()
export class ProducerService {
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly logger = new Logger(ProducerService.name);

  constructor() {
    this.sqsClient = new SQSClient({ region: process.env.REGION });
    this.queueUrl = process.env.TEST_QUEUE;
  }

  private readonly consumerServiceUrl = 'http://localhost:3009';

  async CreateUser(createUserDto: CreateUserDto) {
    const messageBody = {
      operation: 'create',
      user: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        dob: createUserDto.dob,
      },
    };
    const User = await this.getUserStatusAndId(
      messageBody.user.email,
      messageBody.user.dob,
    );
    if (User == 'False') {
      const UserCreation = await this.SendMessageToSQS(messageBody);
      return UserCreation;
    } else {
      this.logger.log(
        `There is a user with the email ${messageBody.user.email} , plz try wit h different mail`,
      );
      return `An User already exists with the mail  ${messageBody.user.email} plz check your details through getID orelse  plz try with different mail`;
    }
  }
  async UpdateUser(updateUserDto: UpdateUserDto) {
    try {
      const messageBody = {
        operation: 'update',
        user: {
          id: updateUserDto.id,
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          dob: updateUserDto.dob,
        },
      };
      const User = await this.getUserDetails(messageBody.user.id);
      if (User.user.status.S === 'blocked') {
        this.logger.warn(
          `User ${User.user.id} is blocked and cannot be updated.`,
        );
        return ` ${User.user.firstName} is blocked and cannot be updated , contact admin for activating the user`;
      } else {
        const UserUpdate = await this.SendMessageToSQS(messageBody);
        return UserUpdate;
      }
    } catch (error) {
      this.logger.error(`Failed to update the user details: ${error.message}`);
      return 'User not found please check the id u have entered you have entered';
    }
  }

  async getUserStatusAndId(email: string, dob: string) {
    try {
      const response = await axios.get(
        `${this.consumerServiceUrl}/consumer/get-user-Status`,
        {
          params: { email, dob },
        },
      );
      this.logger.log(
        `Response from consumer: ${JSON.stringify(response.data)}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get user details: ${error.message}`);
      return 'False';
    }
  }
  async getUserDetails(id: string) {
    try {
      const response = await axios.get(
        `${this.consumerServiceUrl}/consumer/get-user-Details`,
        {
          params: { id },
        },
      );
      this.logger.log(
        `Response from consumer: ${JSON.stringify(response.data)}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get user details: ${error.message}`);
      return 'User not found please check the id you have entered';
    }
  }
  async SendMessageToSQS(messageBody) {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(messageBody),
    });

    await this.sqsClient.send(command);
    this.logger.log(messageBody);
    return `User ${messageBody.user.firstName} have been ${messageBody.operation} successfully`;
  }
}
