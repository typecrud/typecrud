import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { IsInt, IsNotEmpty, Length, Min, Max } from 'class-validator'

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

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
}
