// import { Test, TestingModule } from '@nestjs/testing';
// import { ProducerController } from './producer.controller';
// import { ProducerService } from './producer.service';

// const mockID = 'id238ujndm284ye78wdu82';
// const mockEmail = 'rhjsbdj@gkmail.com';
// const mockDOB = '2098-09-07';
// const mockUserDTO = {
//   id: 'hwedbfcu2873ey8eh2',
//   firstName: 'omf',
//   lastName: 'cards',
//   email: 'omfcards@gmail.com',
//   dob: '2029-08-09',
//   status: 'active',
// };

// describe('ProducerController', () => {
//   let controller: ProducerController;
//   let producerService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [ProducerController],
//       providers: [
//         {
//           provide: ProducerService,
//           useValue: {
//             getUserDetails: jest.fn(),
//             getUserStatusAndId: jest.fn(),
//             sendMessageUpdate: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     controller = module.get<ProducerController>(ProducerController);
//     producerService = module.get<ProducerService>(ProducerService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('getUserDetails', () => {
//     it('should call getUserDetails of ProducerService and return user found', async () => {
//       producerService.getUserDetails.mockResolvedValue('user found');
//       const result = await controller.getUserDetails(mockID);
//       expect(result).toEqual('user found');
//       expect(producerService.getUserDetails).toHaveBeenCalledWith(mockID);
//     });
//   });
//   describe('getUserStatusAndId', () => {
//     it('should take the user input from the producer endpoint and send the data to consumer and getting the response from the consumer  ', async () => {
//       producerService.getUserStatusAndId.mockResolvedValue(
//         'user status is active',
//       );
//       const result = await controller.getUserStatusAndId(mockEmail, mockDOB);
//       expect(result).toEqual('user status is active');
//     });
//   });
//   describe('updateUser', () => {
//     it('should take the details from the endpoint and send them to sqs queue with operation as update and the user details', async () => {
//       producerService.getUserDetails.mockResolvedValue({
//         user: { status: { S: 'active' } },
//       });

//       producerService.sendMessageUpdate.mockResolvedValue('user updated');
//       const result = await controller.UpdateUser(mockUserDTO);
//       expect(result).toEqual('user updated');
//       expect(producerService.sendMessageUpdate).toHaveBeenCalledWith(
//         mockUserDTO,
//       );
//     });

//     it('should warn if the user status is blocked', async () => {
//       producerService.getUserDetails.mockResolvedValue({
//         user: { status: { S: 'blocked' } },
//       });
//       producerService.sendMessageUpdate.mockResolvedValue(
//         'User is blocked contact admin for activating the user',
//       );
//       const result = await controller.UpdateUser(mockUserDTO);
//       expect(result).toEqual(
//         'User is blocked contact admin for activating the user',
//       );
//     });
//   });
//   describe('SendMessage', () => {
//     it('should create a user and send the details to SQS when user does not exist', async () => {
//       producerService.getUserStatusAndId.mockResolvedValue('User not found');

//       producerService.sendMessage.mockResolvedValue('User created');

//       const result = await controller.CreateUser(mockUserDTO);

//       expect(result).toEqual('User omf have been created an account');
//       expect(producerService.sendMessage).toHaveBeenCalledWith(mockUserDTO);
//     });

//     // it('should warn if the user already exists', async () => {
//     //   producerService.getUserStatusAndId.mockResolvedValue('User exists');

//     //   const result = await controller.SendMessage(mockUserDTO);

//     //   expect(result).toEqual(
//     //     'User already exists plz check your id through getID or There is a user with the email that has been entered plz try with different mail',
//     //   );
//     //   expect(producerService.sendMessage).not.toHaveBeenCalled();
//     // });
//   });
// });
