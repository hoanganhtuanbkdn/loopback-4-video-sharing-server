// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  authenticate,
  TokenService,
  UserService,
} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {Filter, model, property, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';
import {PasswordHasherBindings, UserServiceBindings} from '../keys';
import {NodeMailer, ResetPasswordInit, User, KeyAndPassword} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {
  PasswordHasher,
  UserManagementService,
  validateCredentials,
  validateKeyPassword,
} from '../services';
import {OPERATION_SECURITY_SPEC} from '../utils';
import {
  CredentialsRequestBody,
  PasswordResetRequestBody,
  UserProfileSchema,
} from './specs/user-controller.specs';
import isemail from 'isemail';
import {AUTHORIZE_ADMIN} from '../constants';
import {omit} from 'ramda';
@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

export class UserManagementController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @inject(UserServiceBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
  ) {}

  @post('/register', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User> {
    // All new users have the "customer" role by default
    newUserRequest.roles = ['customer'];
    // ensure a valid email value and password value
    validateCredentials(_.pick(newUserRequest, ['email', 'password']));

    try {
      newUserRequest.resetKey = '';
      return await this.userManagementService.createUser(newUserRequest);
    } catch (error) {
      // MongoError 11000 duplicate key
      if (error.code === 11000 && error.errmsg.includes('index: uniqueEmail')) {
        throw new HttpErrors.Conflict('Email value is already taken');
      } else {
        throw error;
      }
    }
  }

  @get('/users', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize(AUTHORIZE_ADMIN)
  async find(
    @param.filter(User) filter?: Filter<User>,
  ): Promise<{data: User[]; count: number}> {
    const [data, count] = await Promise.all([
      this.userRepository.find({
        limit: filter?.limit || 10,
        ...filter,
      }),
      this.userRepository.count(filter?.where),
    ]);

    return {
      data,
      count: count?.count || 0,
    };
  }

  @get('/users/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize(AUTHORIZE_ADMIN)
  async findById(@param.path.number('userId') userId: number): Promise<User> {
    return this.userRepository.findById(userId);
  }

  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async printCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<User> {
    // (@jannyHou)FIXME: explore a way to generate OpenAPI schema
    // for symbol property

    const userId: any = currentUserProfile[securityId];
    return this.userRepository.findById(userId);
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: string}> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    return {token};
  }

  @put('/users/forgot-password', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The updated user profile',
        content: {
          'application/json': {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async forgotPassword(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody(PasswordResetRequestBody) credentials: Credentials,
  ): Promise<{token: string}> {
    const {email, password} = credentials;
    const {id} = currentUserProfile;

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new HttpErrors.NotFound('User account not found');
    }

    if (email !== user?.email) {
      throw new HttpErrors.Forbidden('Invalid email address');
    }

    validateCredentials(_.pick(credentials, ['email', 'password']));

    const passwordHash = await this.passwordHasher.hashPassword(password);

    await this.userRepository
      .userCredentials(user.id)
      .patch({password: passwordHash});

    const userProfile = this.userService.convertToUserProfile(user);

    const token = await this.jwtService.generateToken(userProfile);

    return {token};
  }

  // @post('/users/reset-password/init', {
  //   responses: {
  //     '200': {
  //       description: 'Confirmation that reset password email has been sent',
  //     },
  //   },
  // })
  // async resetPasswordInit(
  //   @requestBody() resetPasswordInit: ResetPasswordInit,
  // ): Promise<string> {
  //   if (!isemail.validate(resetPasswordInit.email)) {
  //     throw new HttpErrors.UnprocessableEntity('Invalid email address');
  //   }

  //   const nodeMailer: NodeMailer =
  //     await this.userManagementService.requestPasswordReset(
  //       resetPasswordInit.email,
  //     );

  //   if (nodeMailer.accepted.length) {
  //     return 'Successfully sent reset password link';
  //   }
  //   throw new HttpErrors.InternalServerError(
  //     'Error sending reset password email',
  //   );
  // }

  // @put('/users/reset-password/finish', {
  //   responses: {
  //     '200': {
  //       description: 'A successful password reset response',
  //     },
  //   },
  // })
  // async resetPasswordFinish(
  //   @requestBody() keyAndPassword: KeyAndPassword,
  // ): Promise<string> {
  //   validateKeyPassword(keyAndPassword);

  //   const foundUser = await this.userRepository.findOne({
  //     where: {resetKey: keyAndPassword.resetKey},
  //   });

  //   if (!foundUser) {
  //     throw new HttpErrors.NotFound(
  //       'No associated account for the provided reset key',
  //     );
  //   }

  //   const user = await this.userManagementService.validateResetKeyLifeSpan(
  //     foundUser,
  //   );

  //   const passwordHash = await this.passwordHasher.hashPassword(
  //     keyAndPassword.password,
  //   );

  //   try {
  //     await this.userRepository
  //       .userCredentials(user.id)
  //       .patch({password: passwordHash});

  //     await this.userRepository.updateById(user.id, user);
  //   } catch (e) {
  //     return e;
  //   }

  //   return 'Password reset successful';
  // }

  // @put('/admin/change-password/{userId}', {
  //   responses: {
  //     '200': {
  //       description: 'A successful password change response',
  //     },
  //   },
  // })
  // async adminChangePassword(
  //   @param.path.string('userId') userId: number,
  //   @requestBody() keyAndPassword: KeyAndPassword,
  // ): Promise<string> {
  //   // validateKeyPassword(keyAndPassword);

  //   // const foundUser = await this.userRepository.findOne({
  //   //   where: {resetKey: keyAndPassword.resetKey},
  //   // });

  //   // if (!foundUser) {
  //   //   throw new HttpErrors.NotFound(
  //   //     'No associated account for the provided reset key',
  //   //   );
  //   // }

  //   // const user = await this.userManagementService.validateResetKeyLifeSpan(
  //   //   foundUser,
  //   // );

  //   return 'Password reset successful';
  // }
}
