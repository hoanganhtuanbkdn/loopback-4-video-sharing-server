import {Filter, FilterExcludingWhere, repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Sharing} from '../models';
import {SharingRepository} from '../repositories';
import {OPERATION_SECURITY_SPEC} from '../utils';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';

export class SharingController {
  constructor(
    @repository(SharingRepository)
    public sharingRepository: SharingRepository,
  ) {}

  @post('/sharings', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Sharing model instance',
        content: {'application/json': {schema: getModelSchemaRef(Sharing)}},
      },
    },
  })
  @authenticate('jwt')
  async create(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sharing, {
            title: 'NewSharing',
            exclude: ['id'],
          }),
        },
      },
    })
    sharing: Omit<Sharing, 'id'>,
  ): Promise<Sharing> {
    const userId = Number(currentUserProfile[securityId]) as unknown as number;
    return this.sharingRepository.create({...sharing, userId});
  }

  @get('/sharings')
  @response(200, {
    description: 'Array of Sharing model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Sharing, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Sharing) filter?: Filter<Sharing>,
  ): Promise<Sharing[]> {
    return this.sharingRepository.find(filter);
  }

  @get('/sharings/{id}')
  @response(200, {
    description: 'Sharing model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Sharing, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Sharing, {exclude: 'where'})
    filter?: FilterExcludingWhere<Sharing>,
  ): Promise<Sharing> {
    return this.sharingRepository.findById(id, filter);
  }

  @patch('/sharings/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Sharing PATCH success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sharing, {partial: true}),
        },
      },
    })
    sharing: Sharing,
  ): Promise<void> {
    await this.sharingRepository.updateById(id, sharing);
  }

  @del('/sharings/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Sharing DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.sharingRepository.deleteById(id);
  }
}
