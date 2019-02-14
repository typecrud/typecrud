import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm'
import { IsNotEmpty, Length } from 'class-validator'
import { User } from './user'

@Entity()
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @IsNotEmpty()
  @Length(1, 100)
  @Column()
  name!: string

  @Column({ name: 'user_id' })
  userId!: string

  @ManyToOne(type => User, user => user.tags, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User
}
