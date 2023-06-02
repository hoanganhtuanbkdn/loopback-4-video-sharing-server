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
  repository, HasManyRepositoryFactory} from '@loopback/repository';
import {User, UserCredentials, Sharing, Room} from '../models';
import {UserCredentialsRepository} from './user-credentials.repository';
import moment from 'moment';
import {PostgresDataSource} from '../datasources';
import {SharingRepository} from './sharing.repository';
import {RoomRepository} from './room.repository';

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

  public readonly sharings: HasManyRepositoryFactory<Sharing, typeof User.prototype.id>;

  public readonly rooms: HasManyRepositoryFactory<Room, typeof User.prototype.id>;

  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>, @repository.getter('SharingRepository') protected sharingRepositoryGetter: Getter<SharingRepository>, @repository.getter('RoomRepository') protected roomRepositoryGetter: Getter<RoomRepository>,
  ) {
    super(User, dataSource);
    this.rooms = this.createHasManyRepositoryFactoryFor('rooms', roomRepositoryGetter,);
    this.registerInclusionResolver('rooms', this.rooms.inclusionResolver);
    this.sharings = this.createHasManyRepositoryFactoryFor('sharings', sharingRepositoryGetter,);
    this.registerInclusionResolver('sharings', this.sharings.inclusionResolver);
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
