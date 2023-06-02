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
import {Message} from '../models';
import {MessageRepository} from '../repositories';

export class MessageController {
  constructor(
    @repository(MessageRepository)
    public messageRepository: MessageRepository,
  ) {}

  @post('/messages')
  @response(200, {
    description: 'Message model instance',
    content: {'application/json': {schema: getModelSchemaRef(Message)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {
            title: 'NewMessage',
            exclude: ['id'],
          }),
        },
      },
    })
    message: Omit<Message, 'id'>,
  ): Promise<Message> {
    return this.messageRepository.create(message);
  }

  @get('/messages')
  @response(200, {
    description: 'Array of Message model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Message, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Message) filter?: Filter<Message>,
  ): Promise<Message[]> {
    return this.messageRepository.find(filter);
  }

  @get('/messages/{id}')
  @response(200, {
    description: 'Message model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Message, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Message, {exclude: 'where'})
    filter?: FilterExcludingWhere<Message>,
  ): Promise<Message> {
    return this.messageRepository.findById(id, filter);
  }

  @patch('/messages/{id}')
  @response(204, {
    description: 'Message PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {partial: true}),
        },
      },
    })
    message: Message,
  ): Promise<void> {
    await this.messageRepository.updateById(id, message);
  }

  @del('/messages/{id}')
  @response(204, {
    description: 'Message DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.messageRepository.deleteById(id);
  }
}
