import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cocktails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  price: number;
}