import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CocktailsService } from './cocktails.service';
import { Cocktails } from './cocktails.entity';
import { ElasticSearch } from '../elasticsearch.service';
import { NotFoundException } from '@nestjs/common';

describe('CocktailsService', () => {
  let service: CocktailsService;
  let repository: Repository<Cocktails>;
  let elasticSearch: ElasticSearch;

  const mockCocktail: Cocktails = {
    id: 1,
    title: 'Mojito',
    description: 'Fresh cocktail with rum and mint',
    price: 9,
  };

  const mockRepository = {
    count: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    insert: jest.fn(),
  };

  const mockElasticSearch = {
    getDocumentCount: jest.fn(),
    indexCocktail: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CocktailsService,
        {
          provide: getRepositoryToken(Cocktails),
          useValue: mockRepository,
        },
        {
          provide: ElasticSearch,
          useValue: mockElasticSearch,
        },
      ],
    }).compile();

    service = module.get<CocktailsService>(CocktailsService);
    repository = module.get<Repository<Cocktails>>(getRepositoryToken(Cocktails));
    elasticSearch = module.get<ElasticSearch>(ElasticSearch);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should synchronize cocktails from DB to ES if counts mismatch', async () => {
      mockRepository.count.mockResolvedValue(2);
      mockElasticSearch.getDocumentCount.mockResolvedValue(1);
      mockRepository.find.mockResolvedValue([mockCocktail]);

      await service.onModuleInit();

      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockElasticSearch.getDocumentCount).toHaveBeenCalledWith('cocktails');
      expect(mockRepository.find).toHaveBeenCalled();
      expect(mockElasticSearch.indexCocktail).toHaveBeenCalledWith(mockCocktail);
    });

    it('should skip synchronization if counts match', async () => {
      mockRepository.count.mockResolvedValue(2);
      mockElasticSearch.getDocumentCount.mockResolvedValue(2);

      await service.onModuleInit();

      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockElasticSearch.getDocumentCount).toHaveBeenCalledWith('cocktails');
      expect(mockRepository.find).not.toHaveBeenCalled();
      expect(mockElasticSearch.indexCocktail).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully during synchronization', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockRepository.count.mockRejectedValue(new Error('DB Error'));

      await service.onModuleInit();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to run initial Elasticsearch synchronization:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('findAll', () => {
    it('should return all cocktails', async () => {
      mockRepository.find.mockResolvedValue([mockCocktail]);

      const result = await service.findAll();

      expect(result).toEqual([mockCocktail]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a cocktail if found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockCocktail);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCocktail);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if cocktail not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('create', () => {
    it('should insert cocktail and index it in ES', async () => {
      mockRepository.insert.mockResolvedValue({ identifiers: [{ id: 2 }] });

      const newCocktail: Cocktails = { title: 'Gin Tonic', description: 'Classic', price: 10 } as Cocktails;
      const result = await service.create(newCocktail);

      expect(result).toEqual({ identifiers: [{ id: 2 }] });
      expect(mockRepository.insert).toHaveBeenCalledWith(newCocktail);
      expect(mockElasticSearch.indexCocktail).toHaveBeenCalledWith({ ...newCocktail, id: 2 });
    });

    it('should not index in ES if insert fails to return an id', async () => {
      mockRepository.insert.mockResolvedValue({ identifiers: [] });

      const newCocktail: Cocktails = { title: 'Gin Tonic', description: 'Classic', price: 10 } as Cocktails;
      await service.create(newCocktail);

      expect(mockElasticSearch.indexCocktail).not.toHaveBeenCalled();
    });

    it('should log warning and succeed if ES indexing fails', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockRepository.insert.mockResolvedValue({ identifiers: [{ id: 2 }] });
      mockElasticSearch.indexCocktail.mockRejectedValue(new Error('ES Error'));

      const newCocktail: Cocktails = { title: 'Gin Tonic', description: 'Classic', price: 10 } as Cocktails;
      await service.create(newCocktail);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to index new cocktail in Elasticsearch: ES Error'
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe('search', () => {
    it('should call elasticSearch.search and return results', async () => {
      mockElasticSearch.search.mockResolvedValue([mockCocktail]);

      const result = await service.search('mint');

      expect(result).toEqual([mockCocktail]);
      expect(mockElasticSearch.search).toHaveBeenCalledWith('mint');
    });

    it('should log warning and return empty array if elasticSearch.search fails', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockElasticSearch.search.mockRejectedValue(new Error('Search failed'));

      const result = await service.search('mint');

      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Elasticsearch search failed: Search failed. Trying database fallback...'
      );
      consoleWarnSpy.mockRestore();
    });
  });
});
