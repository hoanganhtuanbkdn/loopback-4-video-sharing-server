import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

// DEV SERVER

const config = {
  name: process.env.PG_NAME || 'postgres',
  connector: process.env.PG_CONNECTOR || 'postgresql',
  url: '',
  host: process.env.PG_HOST || 'postgres',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASS || '1234abcd',
  database: process.env.PG_DB || 'postgres',
};

// DEV REMOVE

// const config = {
//   name: 'postgres',
//   connector: 'postgresql',
//   url: '',
//   host: process.env.PG_HOST,
//   port: 31653,
//   user: 'postgres',
//   password: '1234abcd',
//   database: 'postgres',
// };

// DEV LOCAL

// const config = {
//   name: 'postgres',
//   connector: 'postgresql',
//   url: '',
//   host: "localhost",
//   port: 5432,
//   user: 'postgres',
//   password: '1234abcd',
//   database: 'utopia'
// };
// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class PostgresDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'postgres';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.postgres', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
