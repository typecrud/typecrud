import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { IsInt, IsNotEmpty, Length, Min, Max } from 'class-validator'
import { Event } from './event'
import { Tag } from './tag'

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @IsNotEmpty()
  @Length(1, 100)
  @Column()
  firstname!: string

  @IsNotEmpty()
  @Length(1, 100)
  @Column()
  lastname!: string

  @IsInt()
  @Min(0)
  @Max(100)
  @Column()
  age!: number

  @OneToMany(type => Tag, tag => tag.user, { cascade: ['insert'] })
  tags!: Tag[]

  @OneToMany(type => Event, event => event.user, { persistence: false })
  events!: Event[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt!: Date
}
