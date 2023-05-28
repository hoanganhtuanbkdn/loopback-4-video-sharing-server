import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model()
export class Sharing extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  videoUrl: string;

  @property({
    type: 'string',
  })
  cover: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;
  @property({
    type: 'date',
  })
  createdAt?: string;

  @belongsTo(() => User)
  userId: number;

  constructor(data?: Partial<Sharing>) {
    super(data);
  }
}

export interface SharingRelations {
  // describe navigational properties here
}

export type SharingWithRelations = Sharing & SharingRelations;
