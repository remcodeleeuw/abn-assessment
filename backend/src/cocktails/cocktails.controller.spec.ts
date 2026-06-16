import { Test, TestingModule } from '@nestjs/testing';
import { CocktailsController } from './cocktails.controller';
import { CocktailsService } from './cocktails.service';
import { Cocktails } from './cocktails.entity';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('CocktailsController Test Suite', () => {
  let controller: CocktailsController;
  let service: CocktailsService;

  const mockCocktail: Cocktails = {
    id: 1,
    title: 'Mojito',
    description: 'Fresh cocktail with rum and mint',
    price: 9,
  };

  const mockCocktailsService = {
    findAll: jest.fn().mockResolvedValue([mockCocktail]),
    findOne: jest.fn().mockResolvedValue(mockCocktail),
    search: jest.fn().mockResolvedValue([mockCocktail]),
    create: jest.fn().mockResolvedValue({ identifiers: [{ id: 1 }] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CocktailsController],
      providers: [
        {
          provide: CocktailsService,
          useValue: mockCocktailsService,
        },
      ],
    }).compile();

    controller = module.get<CocktailsController>(CocktailsController);
    service = module.get<CocktailsService>(CocktailsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchCocktails', () => {
    it('should return all cocktails when no search query is provided', async () => {
      const result = await controller.searchCocktails();
      expect(result).toEqual([mockCocktail]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return filtered cocktails when search query is provided', async () => {
      const query = 'mint';
      const result = await controller.searchCocktails(query);
      expect(result).toEqual([mockCocktail]);
      expect(service.search).toHaveBeenCalledWith(query);
    });

    it('should throw BadRequestException when search query is empty or whitespace', async () => {
      expect(() => controller.searchCocktails('')).toThrow(BadRequestException);
      expect(() => controller.searchCocktails('   ')).toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a specific cocktail based on a number ID', async () => {
      const cocktailId = 1;
      const findOneSpy = jest.spyOn(service, 'findOne');

      const result = await controller.findOne(cocktailId);

      expect(findOneSpy).toHaveBeenCalledWith(cocktailId);
      expect(result).toEqual(mockCocktail);
    });
  });

  it('should throw error when cocktail is not found', async () => {
    const cocktailId = 1;
    const findOneSpy = jest.spyOn(service, 'findOne');

    findOneSpy.mockRejectedValue(new NotFoundException(`Cocktail with id ${cocktailId} not found`));

    await expect(controller.findOne(cocktailId)).rejects.toThrow(NotFoundException);
  });

  describe('newCocktail', () => {
    it('should create a cocktail successfully', async () => {
      const createSpy = jest.spyOn(service, 'create').mockResolvedValue({ identifiers: [{ id: 2 }] } as any);
      
      const result = await controller.newCocktail({
        title: 'New Drink',
        description: 'Nice drink',
        price: 8,
      } as Cocktails);

      expect(createSpy).toHaveBeenCalledWith({
        title: 'New Drink',
        description: 'Nice drink',
        price: 8,
      });
      expect(result).toBe(true);
    });

    it('should throw ConflictException if cocktail title already exists', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new ConflictException('Cocktail with title "Mojito" already exists'));

      await expect(controller.newCocktail({
        title: 'Mojito',
        description: 'duplicate',
        price: 9,
      } as Cocktails)).rejects.toThrow(ConflictException);
    });
  });

});