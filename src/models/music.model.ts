import {Entity, model, property} from '@loopback/repository';

@model()
export class Music extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  roomId?: number;

  @property({
    type: 'string',
    required: true,
  })
  videoUrl: string;

  @property({
    type: 'number',
    required: true,
  })
  index: number;

  @property({
    type: 'date',
  })
  createdAt?: string;

  @property({
    type: 'number',
  })
  submitterId?: number;

  constructor(data?: Partial<Music>) {
    super(data);
  }
}

export interface MusicRelations {
  // describe navigational properties here
}

export type MusicWithRelations = Music & MusicRelations;
