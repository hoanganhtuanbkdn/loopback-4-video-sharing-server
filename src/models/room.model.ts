import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {User} from './user.model';
import {Member} from './member.model';
import {Music} from './music.model';

@model()
export class Room extends Entity {
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
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;
  @property({
    type: 'number',
    default: 0,
  })
  acceptRole?: number;

  @property({
    type: 'date',
  })
  createdAt?: string;

  @belongsTo(() => User)
  ownerId: number;

  @hasMany(() => User, {through: {model: () => Member}})
  users: User[];

  @hasMany(() => Music)
  music: Music[];

  constructor(data?: Partial<Room>) {
    super(data);
  }
}

export interface RoomRelations {
  // describe navigational properties here
}

export type RoomWithRelations = Room & RoomRelations;
