import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Room} from '../models';
import {RoomRepository} from '../repositories';

export class RoomController {
  constructor(
    @repository(RoomRepository)
    public roomRepository: RoomRepository,
  ) {}

  @post('/rooms')
  @response(200, {
    description: 'Room model instance',
    content: {'application/json': {schema: getModelSchemaRef(Room)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Room, {
            title: 'NewRoom',
            exclude: ['id'],
          }),
        },
      },
    })
    room: Omit<Room, 'id'>,
  ): Promise<Room> {
    return this.roomRepository.create(room);
  }

  @get('/rooms')
  @response(200, {
    description: 'Array of Room model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Room, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Room) filter?: Filter<Room>): Promise<Room[]> {
    return this.roomRepository.find(filter);
  }

  @get('/rooms/{id}')
  @response(200, {
    description: 'Room model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Room, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Room, {exclude: 'where'}) filter?: FilterExcludingWhere<Room>,
  ): Promise<Room> {
    return this.roomRepository.findById(id, filter);
  }

  @patch('/rooms/{id}')
  @response(204, {
    description: 'Room PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Room, {partial: true}),
        },
      },
    })
    room: Room,
  ): Promise<void> {
    await this.roomRepository.updateById(id, room);
  }

  @del('/rooms/{id}')
  @response(204, {
    description: 'Room DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.roomRepository.deleteById(id);
  }
}
