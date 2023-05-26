import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';

import {LearnLoopbackApplication} from '../../index';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new LearnLoopbackApplication({
    rest: restConfig,
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: LearnLoopbackApplication;
  client: Client;
}
