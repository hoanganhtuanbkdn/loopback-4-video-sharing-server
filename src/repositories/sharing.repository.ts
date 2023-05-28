import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Sharing, SharingRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class SharingRepository extends DefaultCrudRepository<
  Sharing,
  typeof Sharing.prototype.id,
  SharingRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Sharing.prototype.id>;

  constructor(@inject('datasources.postgres') dataSource: PostgresDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,) {
    super(Sharing, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
