import { Body, Controller, Get, Param, Post, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { Cocktails } from './cocktails.entity';
import { CocktailsService } from './cocktails.service';

@ApiTags('cocktails')
@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all cocktails or perform a fuzzy/prefix search' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Query string to fuzzy search titles and descriptions' })
  @ApiResponse({ status: 200, description: 'Return a list of cocktails matching search criteria or all cocktails', type: [Cocktails] })
  @ApiResponse({ status: 400, description: 'Search term is empty or only whitespace' })
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
  @ApiOperation({ summary: 'Retrieve a single cocktail by its ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Unique identifier of the cocktail' })
  @ApiResponse({ status: 200, description: 'Return the cocktail details', type: Cocktails })
  @ApiResponse({ status: 404, description: 'Cocktail with the given ID was not found' })
  findOne(@Param('id') id: number): Promise<Cocktails> {
    return this.cocktailsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new cocktail' })
  @ApiBody({ type: Cocktails, description: 'Payload containing details of the new cocktail' })
  @ApiResponse({ status: 201, description: 'The cocktail was successfully created', type: Boolean })
  @ApiResponse({ status: 409, description: 'Conflict: A cocktail with the given title already exists' })
  async newCocktail(@Body() cocktail: Cocktails) {
    console.log("info: creating cocktail", cocktail)
    const res = await this.cocktailsService.create(cocktail);
    console.log("res", res);
    return true;
  }
}
