import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm'

import { CommonEntity } from '~/common/entity/common.entity'
import { UserEntity } from '~/modules/user/user.entity'

@Entity('aigc')
export class AiGcEntity extends CommonEntity {
  @Column()
  @ApiProperty({ description: 'aigc' })
  value: string

  @ApiProperty({ description: 'aigc' })
  @Column({ default: false })
  status: boolean

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>
}

@Entity('chat_message')
export class ChatMessage extends CommonEntity {
  @ApiProperty({ description: 'Chat item message role' })
  role: string

  @ApiProperty({ description: 'Chat item message content' })
  content: string
}
