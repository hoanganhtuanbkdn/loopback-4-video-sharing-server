import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  User,
  Sharing,
} from '../models';
import {UserRepository} from '../repositories';

export class UserSharingController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/sharings', {
    responses: {
      '200': {
        description: 'Array of User has many Sharing',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Sharing)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Sharing>,
  ): Promise<Sharing[]> {
    return this.userRepository.sharings(id).find(filter);
  }

  @post('/users/{id}/sharings', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Sharing)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sharing, {
            title: 'NewSharingInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) sharing: Omit<Sharing, 'id'>,
  ): Promise<Sharing> {
    return this.userRepository.sharings(id).create(sharing);
  }

  @patch('/users/{id}/sharings', {
    responses: {
      '200': {
        description: 'User.Sharing PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sharing, {partial: true}),
        },
      },
    })
    sharing: Partial<Sharing>,
    @param.query.object('where', getWhereSchemaFor(Sharing)) where?: Where<Sharing>,
  ): Promise<Count> {
    return this.userRepository.sharings(id).patch(sharing, where);
  }

  @del('/users/{id}/sharings', {
    responses: {
      '200': {
        description: 'User.Sharing DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Sharing)) where?: Where<Sharing>,
  ): Promise<Count> {
    return this.userRepository.sharings(id).delete(where);
  }
}
