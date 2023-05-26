// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {UserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/context';

import {User} from './models';
import {Credentials} from './repositories';
import {JWTService, PasswordHasher} from './services';
import {FileUploadHandler} from './types';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE =
    process.env.TOKEN_SECRET_VALUE ?? '4nh7u4nut0jwts3cr3tut0p1a';
  export const TOKEN_EXPIRES_IN_VALUE =
    process.env.TOKEN_EXPIRES_IN_VALUE ?? '604800';
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<JWTService>(
    'services.authentication.jwt.tokenservice',
  );
}

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER =
    BindingKey.create<PasswordHasher>('services.hasher');
  export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );
}

/**
 * Binding key for the file upload service
 */
export const FILE_UPLOAD_SERVICE = BindingKey.create<FileUploadHandler>(
  'services.FileUpload',
);

/**
 * Binding key for the storage directory
 */
export const STORAGE_DIRECTORY = BindingKey.create<string>('storage.directory');

export namespace UserServieceBidings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );
}