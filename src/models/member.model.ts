import {Entity, model, property} from '@loopback/repository';

@model()
export class Member extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  userId?: number;

  @property({
    type: 'number',
  })
  roomId?: number;

  @property({
    type: 'string',
  })
  member_role?: string;

  @property({
    type: 'string',
  })
  status?: string;

  @property({
    type: 'date',
  })
  joinedAt?: string;


  constructor(data?: Partial<Member>) {
    super(data);
  }
}

export interface MemberRelations {
  // describe navigational properties here
}

export type MemberWithRelations = Member & MemberRelations;
