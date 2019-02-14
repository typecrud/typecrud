import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, ManyToMany } from 'typeorm'
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

  @ManyToMany(type => User, user => user.tags)
  users!: User[]
}
