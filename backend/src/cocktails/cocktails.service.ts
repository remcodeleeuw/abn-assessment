import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cocktails } from './cocktails.entity';

@Injectable()
export class CocktailsService {
  constructor(
    @InjectRepository(Cocktails)
    private usersRepository: Repository<Cocktails>,
  ) { }

  findAll(): Promise<Cocktails[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<Cocktails> {
    const cocktail = await this.usersRepository.findOneBy({ id });

    if (!cocktail) {
      throw new NotFoundException(`Cocktail with id ${id} not found`);
    }

    return cocktail;
  }

  create(cocktail: Cocktails) {
    return this.usersRepository.insert(cocktail);
  }

}