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
Room,
Member,
User,
} from '../models';
import {RoomRepository} from '../repositories';

export class RoomUserController {
  constructor(
    @repository(RoomRepository) protected roomRepository: RoomRepository,
  ) { }

  @get('/rooms/{id}/users', {
    responses: {
      '200': {
        description: 'Array of Room has many User through Member',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<User>,
  ): Promise<User[]> {
    return this.roomRepository.users(id).find(filter);
  }

  @post('/rooms/{id}/users', {
    responses: {
      '200': {
        description: 'create a User model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Room.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUserInRoom',
            exclude: ['id'],
          }),
        },
      },
    }) user: Omit<User, 'id'>,
  ): Promise<User> {
    return this.roomRepository.users(id).create(user);
  }

  @patch('/rooms/{id}/users', {
    responses: {
      '200': {
        description: 'Room.User PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: Partial<User>,
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return this.roomRepository.users(id).patch(user, where);
  }

  @del('/rooms/{id}/users', {
    responses: {
      '200': {
        description: 'Room.User DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return this.roomRepository.users(id).delete(where);
  }
}
