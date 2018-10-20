import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm'
import { IsNotEmpty, Length } from 'class-validator'
import { User } from './user'

@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @IsNotEmpty()
  @Length(1, 100)
  @Column()
  name!: string

  @ManyToOne(type => User, user => user.events)
  user!: User

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
