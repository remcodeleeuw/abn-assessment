import { Body, Controller, Get, Param, Post, Query, BadRequestException } from '@nestjs/common';
import { Cocktails } from './cocktails.entity';
import { CocktailsService } from './cocktails.service';

@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Get()
  searchCocktails(@Query('search') search?: string) : Promise<Cocktails[]> {
    if (search !== undefined) {
      const trimmed = search.trim();
      if (trimmed === '') {
        throw new BadRequestException('Search query cannot be empty');
      }
      return this.cocktailsService.search(trimmed);
    }
    return this.cocktailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Cocktails> {
    return this.cocktailsService.findOne(id);
  }

  @Post()
  async newCocktail(@Body() cocktail: Cocktails) {
    console.log("info: creating cocktail", cocktail)
    const res = await this.cocktailsService.create(cocktail);
    console.log("res", res);
    return true;
  }
}
