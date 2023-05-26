import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Sharing, SharingRelations} from '../models';

export class SharingRepository extends DefaultCrudRepository<
  Sharing,
  typeof Sharing.prototype.id,
  SharingRelations
> {
  constructor(@inject('datasources.postgres') dataSource: PostgresDataSource) {
    super(Sharing, dataSource);
  }
}
