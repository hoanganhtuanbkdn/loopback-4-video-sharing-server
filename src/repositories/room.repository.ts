import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyThroughRepositoryFactory, HasManyRepositoryFactory} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Room, RoomRelations, User, Member, Music, Message} from '../models';
import {UserRepository} from './user.repository';
import {MemberRepository} from './member.repository';
import {MusicRepository} from './music.repository';
import {MessageRepository} from './message.repository';

export class RoomRepository extends DefaultCrudRepository<
  Room,
  typeof Room.prototype.id,
  RoomRelations
> {

  public readonly owner: BelongsToAccessor<User, typeof Room.prototype.id>;

  public readonly users: HasManyThroughRepositoryFactory<User, typeof User.prototype.id,
          Member,
          typeof Room.prototype.id
        >;

  public readonly music: HasManyRepositoryFactory<Music, typeof Room.prototype.id>;

  public readonly messages: HasManyRepositoryFactory<Message, typeof Room.prototype.id>;

  constructor(@inject('datasources.postgres') dataSource: PostgresDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('MemberRepository') protected memberRepositoryGetter: Getter<MemberRepository>, @repository.getter('MusicRepository') protected musicRepositoryGetter: Getter<MusicRepository>, @repository.getter('MessageRepository') protected messageRepositoryGetter: Getter<MessageRepository>,) {
    super(Room, dataSource);
    this.messages = this.createHasManyRepositoryFactoryFor('messages', messageRepositoryGetter,);
    this.registerInclusionResolver('messages', this.messages.inclusionResolver);
    this.music = this.createHasManyRepositoryFactoryFor('music', musicRepositoryGetter,);
    this.registerInclusionResolver('music', this.music.inclusionResolver);
    this.users = this.createHasManyThroughRepositoryFactoryFor('users', userRepositoryGetter, memberRepositoryGetter,);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
    this.owner = this.createBelongsToAccessorFor('owner', userRepositoryGetter,);
    this.registerInclusionResolver('owner', this.owner.inclusionResolver);
  }
}
