import {Constructor, Context} from '@loopback/context';
import {RestServer} from '@loopback/rest';
import {Server, ServerOptions, Socket} from 'socket.io';
import {
  getWebSocketMetadata,
  WebSocketMetadata,
} from './decorators/websocket.decorator';
import {WebSocketControllerFactory} from './websocket-controller-factory';

const debug = require('debug')('loopback:websocket');

/* eslint-disable @typescript-eslint/no-explicit-any */
export type SockIOMiddleware = (
  socket: Socket,
  fn: (err?: any) => void,
) => void;

/**
 * A websocket server
 */
export class WebSocketServer extends Context {
  private io: Server;

  constructor(
    public ctx: Context,
    public readonly restServer: RestServer,
    private options?: ServerOptions,
  ) {
    super(ctx);
    console.log({options});

    this.io = new Server({
      ...options,
      cors: {
        origin: [
          'http://localhost:3000',
          'https://remitano-web-gamma.vercel.app',
        ],
      },
    });
    ctx.bind('ws.server').to(this.io);
  }

  /**
   * Register a sock.io middleware function
   * @param fn
   */
  use(fn: SockIOMiddleware) {
    return this.io.use(fn);
  }

  /**
   * Register a websocket controller
   * @param controllerClass
   * @param meta
   */

  // eslint-disable-next-line @typescript-eslint/naming-convention
  route(
    controllerClass: Constructor<any>,
    meta?: WebSocketMetadata | string | RegExp,
  ) {
    if (meta instanceof RegExp || typeof meta === 'string') {
      meta = {namespace: meta} as WebSocketMetadata;
    }
    if (meta == null) {
      meta = getWebSocketMetadata(controllerClass) as WebSocketMetadata;
    }
    const nsp = meta?.namespace ? this.io.of(meta.namespace) : this.io;
    if (meta?.name) {
      this.ctx.bind(`ws.namespace.${meta.name}`).to(nsp);
    }

    /* eslint-disable @typescript-eslint/no-misused-promises */
    nsp.on('connection', async socket => {
      console.log('connection', 'connection');
      debug(
        'Websocket connected: id=%s namespace=%s',
        socket.id,
        socket.nsp.name,
      );
      // Create a request context
      const reqCtx = new Context(this);
      // Bind websocket
      reqCtx.bind('ws.socket').to(socket);
      // Instantiate the controller instance
      await new WebSocketControllerFactory(reqCtx, controllerClass).create(
        socket,
      );
    });
    return nsp;
  }

  /**
   * Start the websocket server
   */
  async start() {
    await this.restServer.start();
    const appServer = this.restServer?.httpServer?.server as any;
    this.io.attach(appServer, this.options);
  }

  /**
   * Stop the websocket server
   */
  async stop() {
    const close = new Promise<void>((resolve, reject) => {
      this.io.close(() => {
        resolve();
      });
    });
    await close;
    await this.restServer.stop();
  }
}
