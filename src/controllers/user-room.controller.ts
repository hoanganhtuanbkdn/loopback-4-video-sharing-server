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
  Room,
} from '../models';
import {UserRepository} from '../repositories';

export class UserRoomController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/rooms', {
    responses: {
      '200': {
        description: 'Array of User has many Room',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Room)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Room>,
  ): Promise<Room[]> {
    return this.userRepository.rooms(id).find(filter);
  }

  @post('/users/{id}/rooms', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Room)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Room, {
            title: 'NewRoomInUser',
            exclude: ['id'],
            optional: ['ownerId']
          }),
        },
      },
    }) room: Omit<Room, 'id'>,
  ): Promise<Room> {
    return this.userRepository.rooms(id).create(room);
  }

  @patch('/users/{id}/rooms', {
    responses: {
      '200': {
        description: 'User.Room PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Room, {partial: true}),
        },
      },
    })
    room: Partial<Room>,
    @param.query.object('where', getWhereSchemaFor(Room)) where?: Where<Room>,
  ): Promise<Count> {
    return this.userRepository.rooms(id).patch(room, where);
  }

  @del('/users/{id}/rooms', {
    responses: {
      '200': {
        description: 'User.Room DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Room)) where?: Where<Room>,
  ): Promise<Count> {
    return this.userRepository.rooms(id).delete(where);
  }
}
