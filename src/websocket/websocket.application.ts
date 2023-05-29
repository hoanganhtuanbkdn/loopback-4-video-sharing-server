import {Constructor} from '@loopback/context';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {Namespace} from 'socket.io';
import {WebSocketServer} from './websocket.server';

export {ApplicationConfig};

export class WebsocketApplication extends RestApplication {
  readonly wsServer: WebSocketServer;

  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.wsServer = new WebSocketServer(this, this.restServer);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public websocketRoute(
    controllerClass: Constructor<any>,
    namespace?: string | RegExp,
  ): Namespace {
    return this.wsServer.route(controllerClass, namespace) as Namespace;
  }

  public async start(): Promise<void> {
    await this.wsServer.start();
  }

  public async stop(): Promise<void> {
    await this.wsServer.stop();
  }
}
