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
  Message,
} from '../models';
import {RoomRepository} from '../repositories';

export class RoomMessageController {
  constructor(
    @repository(RoomRepository) protected roomRepository: RoomRepository,
  ) { }

  @get('/rooms/{id}/messages', {
    responses: {
      '200': {
        description: 'Array of Room has many Message',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Message)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Message>,
  ): Promise<Message[]> {
    return this.roomRepository.messages(id).find(filter);
  }

  @post('/rooms/{id}/messages', {
    responses: {
      '200': {
        description: 'Room model instance',
        content: {'application/json': {schema: getModelSchemaRef(Message)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Room.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {
            title: 'NewMessageInRoom',
            exclude: ['id'],
            optional: ['roomId']
          }),
        },
      },
    }) message: Omit<Message, 'id'>,
  ): Promise<Message> {
    return this.roomRepository.messages(id).create(message);
  }

  @patch('/rooms/{id}/messages', {
    responses: {
      '200': {
        description: 'Room.Message PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {partial: true}),
        },
      },
    })
    message: Partial<Message>,
    @param.query.object('where', getWhereSchemaFor(Message)) where?: Where<Message>,
  ): Promise<Count> {
    return this.roomRepository.messages(id).patch(message, where);
  }

  @del('/rooms/{id}/messages', {
    responses: {
      '200': {
        description: 'Room.Message DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Message)) where?: Where<Message>,
  ): Promise<Count> {
    return this.roomRepository.messages(id).delete(where);
  }
}
