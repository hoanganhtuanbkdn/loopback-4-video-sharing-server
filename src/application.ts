import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {AuthorizationComponent} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {
  ApplicationConfig,
  BindingKey,
  createBindingFromClass,
} from '@loopback/core';
import {RepositoryMixin, SchemaMigrationOptions} from '@loopback/repository';
import {RestApplication, RestBindings} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';

import multer from 'multer';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import fs from 'fs';

import {
  FILE_UPLOAD_SERVICE,
  STORAGE_DIRECTORY,
  TokenServiceConstants,
  UserServieceBidings,
} from './keys';
import {PasswordHasherBindings, UserServiceBindings} from './keys';
import {ErrorHandlerMiddlewareProvider} from './middlewares';
import {MySequence} from './sequence';
import {
  BcryptHasher,
  JWTService,
  SecuritySpecEnhancer,
  UserManagementService,
} from './services';
import {PerformanceObserver} from 'perf_hooks';
import {UserRepository} from './repositories';
import YAML = require('yaml');
import {UserWithPassword} from './models';
import {WebsocketApplication} from './websocket/websocket.application';
import {WebsocketControllerBooter} from './websocket/websocket.booter';

export {ApplicationConfig};

/**
 * Information from package.json
 */
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
export const PackageKey = BindingKey.create<PackageInfo>('application.package');

const perfObserver = new PerformanceObserver(items => {
  items.getEntries().forEach(entry => {
    console.log(`server-app [${entry.name}] duration {${entry.duration}}`);
  });
});
perfObserver.observe({entryTypes: ['measure']});

const pkg: PackageInfo = require('../package.json');

export class LearnLoopbackApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(WebsocketApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.component(AuthorizationComponent);

    this.booters(WebsocketControllerBooter);

    this.setUpBindings();

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    // Configure file upload with multer options
    this.configureFileUpload(options.fileStorageDirectory);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
      websocketControllers: {
        dirs: ['ws-controllers'],
        extensions: ['.controller.ws.js'],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    // Bind package.json to the application context
    this.bind(PackageKey).to(pkg);
    // Bind bcrypt hash services
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);

    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

    this.bind(UserServiceBindings.USER_SERVICE).toClass(UserManagementService);
    this.add(createBindingFromClass(SecuritySpecEnhancer));

    this.add(createBindingFromClass(ErrorHandlerMiddlewareProvider));

    this.bind(RestBindings.ERROR_WRITER_OPTIONS).to({debug: true});
  }

  /**
   * Configure `multer` options for file upload
   */
  protected configureFileUpload(destination?: string) {
    // Upload files to `dist/.sandbox` by default
    destination = destination ?? path.join(__dirname, '../.sandbox');
    this.bind(STORAGE_DIRECTORY).to(destination);
    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        destination,
        filename: function (req, file, cb) {
          const filename = uuidv4();
          // get type .mp4 or .jpg from filename.mp4 or filename.jpg
          const types = file.originalname.split('.');
          cb(null, filename + '.' + types?.[types?.length - 1]);
        },
      }),
      // limits: {
      //   fileSize: 10 * 1024 * 1024,
      // },
    };
    // Configure the file upload service with multer options
    this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }

  async migrateSchema(options?: SchemaMigrationOptions): Promise<void> {
    await super.migrateSchema(options);

    // Pre-populate users
    const userRepo = await this.getRepository(UserRepository);
    const userAmount = await userRepo.count();
    if (userAmount.count === 0) {
      const userDir = path.join(__dirname, '../fixtures/users');
      const userFiles = fs.readdirSync(userDir);

      for (const file of userFiles) {
        if (file.endsWith('.yml')) {
          const userFile = path.join(userDir, file);
          const yamlString = YAML.parse(fs.readFileSync(userFile, 'utf8'));
          const userWithPassword = new UserWithPassword(yamlString);
          const userManagementService = await this.get<UserManagementService>(
            UserServieceBidings.USER_SERVICE,
          );
          await userManagementService.createUser(userWithPassword);
        }
      }
    }

    // const newsRepo = await this.getRepository(NewsRepository);
    // const newsAmount = await newsRepo.count();

    // if (newsAmount.count === 0) {
    //   const newsDir = path.join(__dirname, '../fixtures/news');
    //   const newsFiles = fs.readdirSync(newsDir);

    //   for (const file of newsFiles) {
    //     if (file.endsWith('.yml')) {
    //       const newsFile = path.join(newsDir, file);
    //       const yamlString = YAML.parse(fs.readFileSync(newsFile, 'utf8'));
    //       await newsRepo.create(yamlString);
    //     }
    //   }
    // }
  }
}
