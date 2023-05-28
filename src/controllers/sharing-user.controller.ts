import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Sharing,
  User,
} from '../models';
import {SharingRepository} from '../repositories';

export class SharingUserController {
  constructor(
    @repository(SharingRepository)
    public sharingRepository: SharingRepository,
  ) { }

  @get('/sharings/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Sharing',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof Sharing.prototype.id,
  ): Promise<User> {
    return this.sharingRepository.user(id);
  }
}
