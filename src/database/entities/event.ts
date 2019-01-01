import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm'
import { IsNotEmpty, Length, IsDate } from 'class-validator'
import { User } from './user'
import { Type } from 'class-transformer'

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

  @IsDate()
  @Type(() => Date)
  @Column('timestamp with time zone')
  startsAt!: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
