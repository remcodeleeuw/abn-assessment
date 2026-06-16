import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Cocktails {
  @ApiProperty({ example: 1, description: 'The unique identifier of the cocktail' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Virgin Mojito', description: 'The title of the cocktail (must be unique)' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Refreshing mix of mint, lime, and soda water.', description: 'Detailed description of ingredients and instructions' })
  @Column()
  description: string;

  @ApiProperty({ example: 4.5, description: 'Price of the cocktail in Euros (€)' })
  @Column()
  price: number;
}