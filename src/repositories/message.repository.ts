import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Message, MessageRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class MessageRepository extends DefaultCrudRepository<
  Message,
  typeof Message.prototype.id,
  MessageRelations
> {

  public readonly sender: BelongsToAccessor<User, typeof Message.prototype.id>;

  constructor(@inject('datasources.postgres') dataSource: PostgresDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,) {
    super(Message, dataSource);
    this.sender = this.createBelongsToAccessorFor('sender', userRepositoryGetter,);
    this.registerInclusionResolver('sender', this.sender.inclusionResolver);
  }
}
