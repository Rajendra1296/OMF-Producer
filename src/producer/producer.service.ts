import { Injectable, Logger } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CreateUserDto } from './DTO/User.dto';
import { UpdateUserDto } from './DTO/Updateuser.dto';
import axios from 'axios';

import * as AWSXRay from 'aws-xray-sdk-core';

@Injectable()
export class ProducerService {
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly logger = new Logger(ProducerService.name);
  private readonly consumerServiceUrl = 'http://localhost:3009';

  constructor() {
    this.sqsClient = new SQSClient({
      region: process.env.REGION,
      // endpoint: 'http://localhost:4566',
    });
    this.queueUrl = process.env.TEST_QUEUE;
  }

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
    const segment = AWSXRay.getSegment();
    // Start a new X-Ray subsegment for user creation
    const subsegment = segment.addNewSubsegment('CreateUser');
    try {
      const segment = AWSXRay.getSegment(); // Retrieve the current segment
      this.logger.log(`segemnt: ${segment}`); // Log the trace ID

      const User = await this.getUserStatusAndId(
        messageBody.user.email,
        messageBody.user.dob,
      );
      if (User === 'False') {
        const UserCreation = await this.SendMessageToSQS(messageBody);
        return UserCreation;
      } else {
        this.logger.log(
          `User with email ${messageBody.user.email} already exists.`,
        );
        return `An User already exists with the email ${messageBody.user.email}. Please try with a different email.`;
      }
    } catch (error) {
      this.logger.error(`Error in CreateUser: ${error.message}`);
      subsegment.addError(error); // Capture error in X-Ray
      throw error;
    } finally {
      subsegment.close(); // Close the subsegment
    }
  }

  async UpdateUser(updateUserDto: UpdateUserDto) {
    const subsegment = AWSXRay.getSegment().addNewSubsegment('UpdateUser');
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
        return `${User.user.firstName} is blocked and cannot be updated; contact admin for activation.`;
      } else {
        const UserUpdate = await this.SendMessageToSQS(messageBody);
        return UserUpdate;
      }
    } catch (error) {
      this.logger.error(`Failed to update user details: ${error.message}`);
      subsegment.addError(error); // Capture error in X-Ray
      throw error;
    } finally {
      subsegment.close(); // Close the subsegment
    }
  }

  async getUserStatusAndId(email: string, dob: string) {
    const subsegment =
      AWSXRay.getSegment().addNewSubsegment('getUserStatusAndId');
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
      subsegment.addError(error); // Capture error in X-Ray
      return 'False';
    } finally {
      subsegment.close(); // Close the subsegment
    }
  }

  async getUserDetails(id: string) {
    const subsegment = AWSXRay.getSegment().addNewSubsegment('getUserDetails');
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
      subsegment.addError(error); // Capture error in X-Ray
      return 'User not found; please check the ID you have entered.';
    } finally {
      subsegment.close(); // Close the subsegment
    }
  }

  async SendMessageToSQS(messageBody) {
    const subsegment =
      AWSXRay.getSegment().addNewSubsegment('SendMessageToSQS');
    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(messageBody),
      });

      await this.sqsClient.send(command);
      this.logger.log(`Message sent to SQS: ${JSON.stringify(messageBody)}`);
      return `User ${messageBody.user.firstName} has been ${messageBody.operation} successfully.`;
    } catch (error) {
      this.logger.error(`Failed to send message to SQS: ${error.message}`);
      subsegment.addError(error); // Capture error in X-Ray
      throw error;
    } finally {
      subsegment.close(); // Close the subsegment
    }
  }
}
