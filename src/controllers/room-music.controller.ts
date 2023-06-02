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
  Music,
} from '../models';
import {RoomRepository} from '../repositories';

export class RoomMusicController {
  constructor(
    @repository(RoomRepository) protected roomRepository: RoomRepository,
  ) { }

  @get('/rooms/{id}/music', {
    responses: {
      '200': {
        description: 'Array of Room has many Music',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Music)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Music>,
  ): Promise<Music[]> {
    return this.roomRepository.music(id).find(filter);
  }

  @post('/rooms/{id}/music', {
    responses: {
      '200': {
        description: 'Room model instance',
        content: {'application/json': {schema: getModelSchemaRef(Music)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Room.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Music, {
            title: 'NewMusicInRoom',
            exclude: ['id'],
            optional: ['roomId']
          }),
        },
      },
    }) music: Omit<Music, 'id'>,
  ): Promise<Music> {
    return this.roomRepository.music(id).create(music);
  }

  @patch('/rooms/{id}/music', {
    responses: {
      '200': {
        description: 'Room.Music PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Music, {partial: true}),
        },
      },
    })
    music: Partial<Music>,
    @param.query.object('where', getWhereSchemaFor(Music)) where?: Where<Music>,
  ): Promise<Count> {
    return this.roomRepository.music(id).patch(music, where);
  }

  @del('/rooms/{id}/music', {
    responses: {
      '200': {
        description: 'Room.Music DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Music)) where?: Where<Music>,
  ): Promise<Count> {
    return this.roomRepository.music(id).delete(where);
  }
}
