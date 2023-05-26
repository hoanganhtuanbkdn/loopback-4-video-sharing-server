import {Entity, model, property} from '@loopback/repository';

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
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'number',
    required: true,
  })
  userId: number;

  @property({
    type: 'date',
  })
  createdAt?: string;


  constructor(data?: Partial<Sharing>) {
    super(data);
  }
}

export interface SharingRelations {
  // describe navigational properties here
}

export type SharingWithRelations = Sharing & SharingRelations;
