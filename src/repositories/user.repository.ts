// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  AnyObject,
  DataObject,
  DeepPartial,
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {User, UserCredentials} from '../models';
import {UserCredentialsRepository} from './user-credentials.repository';
import moment from 'moment';
import {PostgresDataSource} from '../datasources';

export type Credentials = {
  email: string;
  password: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  public readonly userCredentials: HasOneRepositoryFactory<
    UserCredentials,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>,
  ) {
    super(User, dataSource);
    this.userCredentials = this.createHasOneRepositoryFactoryFor(
      'userCredentials',
      userCredentialsRepositoryGetter,
    );
  }

  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    try {
      return await this.userCredentials(userId).get();
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }

  async create(
    entity: Partial<User> | {[P in keyof User]?: DeepPartial<User[P]>} | User,
    options?: AnyObject,
  ): Promise<User> {
    const newData = {
      ...entity,
      createdAt: moment().utc().toISOString(),
    };

    return super.create(newData, options);
  }

  async updateById(id: number, data: DataObject<User>, options?: AnyObject): Promise<void> {
    const newData = {
      ...data,
      updatedAt: moment().utc().toISOString(),
    };

    return super.updateById(id, newData, options);
  }
}
