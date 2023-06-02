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
import {Music} from '../models';
import {MusicRepository} from '../repositories';

export class MusicController {
  constructor(
    @repository(MusicRepository)
    public musicRepository : MusicRepository,
  ) {}

  @post('/music')
  @response(200, {
    description: 'Music model instance',
    content: {'application/json': {schema: getModelSchemaRef(Music)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Music, {
            title: 'NewMusic',
            exclude: ['id'],
          }),
        },
      },
    })
    music: Omit<Music, 'id'>,
  ): Promise<Music> {
    return this.musicRepository.create(music);
  }

  @get('/music/count')
  @response(200, {
    description: 'Music model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Music) where?: Where<Music>,
  ): Promise<Count> {
    return this.musicRepository.count(where);
  }

  @get('/music')
  @response(200, {
    description: 'Array of Music model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Music, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Music) filter?: Filter<Music>,
  ): Promise<Music[]> {
    return this.musicRepository.find(filter);
  }

  @patch('/music')
  @response(200, {
    description: 'Music PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Music, {partial: true}),
        },
      },
    })
    music: Music,
    @param.where(Music) where?: Where<Music>,
  ): Promise<Count> {
    return this.musicRepository.updateAll(music, where);
  }

  @get('/music/{id}')
  @response(200, {
    description: 'Music model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Music, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Music, {exclude: 'where'}) filter?: FilterExcludingWhere<Music>
  ): Promise<Music> {
    return this.musicRepository.findById(id, filter);
  }

  @patch('/music/{id}')
  @response(204, {
    description: 'Music PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Music, {partial: true}),
        },
      },
    })
    music: Music,
  ): Promise<void> {
    await this.musicRepository.updateById(id, music);
  }

  @put('/music/{id}')
  @response(204, {
    description: 'Music PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() music: Music,
  ): Promise<void> {
    await this.musicRepository.replaceById(id, music);
  }

  @del('/music/{id}')
  @response(204, {
    description: 'Music DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.musicRepository.deleteById(id);
  }
}
