import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Music, MusicRelations} from '../models';

export class MusicRepository extends DefaultCrudRepository<
  Music,
  typeof Music.prototype.id,
  MusicRelations
> {
  constructor(@inject('datasources.postgres') dataSource: PostgresDataSource) {
    super(Music, dataSource);
  }
}
