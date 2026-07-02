import { Test, TestingModule } from '@nestjs/testing';
import { ElasticSearch } from './elasticsearch.service';
import { Cocktails } from './cocktails/cocktails.entity';

const mockPing = jest.fn();
const mockCount = jest.fn();
const mockIndicesExists = jest.fn();
const mockIndicesCreate = jest.fn();
const mockIndex = jest.fn();
const mockSearch = jest.fn();

jest.mock('@elastic/elasticsearch', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        ping: mockPing,
        count: mockCount,
        indices: {
          exists: mockIndicesExists,
          create: mockIndicesCreate,
        },
        index: mockIndex,
        search: mockSearch,
      };
    }),
  };
});

describe('ElasticSearch Service', () => {
  let service: ElasticSearch;

  const mockCocktail: Cocktails = {
    id: 1,
    title: 'Mojito',
    description: 'Fresh cocktail with rum and mint',
    price: 9,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ElasticSearch],
    }).compile();

    service = module.get<ElasticSearch>(ElasticSearch);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkConnection', () => {
    it('should ping elasticsearch successfully', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
      mockPing.mockResolvedValue(true);

      await service.checkConnection();

      expect(mockPing).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Elasticsearch cluster is up and running:', true);
      consoleLogSpy.mockRestore();
    });

    it('should handle ping error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      mockPing.mockRejectedValue(new Error('Connection error'));

      await service.checkConnection();

      expect(mockPing).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Elasticsearch cluster is down!', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getDocumentCount', () => {
    it('should return count from elasticsearch client', async () => {
      mockCount.mockResolvedValue({ count: 42 });

      const count = await service.getDocumentCount('cocktails');

      expect(count).toBe(42);
      expect(mockCount).toHaveBeenCalledWith({ index: 'cocktails' });
    });

    it('should return 0 if elasticsearch client throws an error', async () => {
      mockCount.mockRejectedValue(new Error('Count failed'));

      const count = await service.getDocumentCount('cocktails');

      expect(count).toBe(0);
    });
  });

  describe('initIndex', () => {
    it('should create index if it does not exist', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
      mockIndicesExists.mockResolvedValue(false);
      mockIndicesCreate.mockResolvedValue({});

      await service.initIndex();

      expect(mockIndicesExists).toHaveBeenCalledWith({ index: 'cocktails' });
      expect(mockIndicesCreate).toHaveBeenCalledWith({ index: 'cocktails' });
      expect(consoleLogSpy).toHaveBeenCalledWith('Created index "cocktails" in Elasticsearch');
      consoleLogSpy.mockRestore();
    });

    it('should not create index if it already exists', async () => {
      mockIndicesExists.mockResolvedValue(true);

      await service.initIndex();

      expect(mockIndicesExists).toHaveBeenCalledWith({ index: 'cocktails' });
      expect(mockIndicesCreate).not.toHaveBeenCalled();
    });

    it('should handle errors in initIndex gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      mockIndicesExists.mockRejectedValue(new Error('Exists failed'));

      await service.initIndex();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing index "cocktails":', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('indexCocktail', () => {
    it('should index cocktail successfully', async () => {
      mockIndex.mockResolvedValue({});

      await service.indexCocktail(mockCocktail);

      expect(mockIndex).toHaveBeenCalledWith({
        index: 'cocktails',
        id: '1',
        document: {
          id: 1,
          title: 'Mojito',
          description: 'Fresh cocktail with rum and mint',
          price: 9,
        },
      });
    });

    it('should handle index errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      mockIndex.mockRejectedValue(new Error('Indexing failed'));

      await service.indexCocktail(mockCocktail);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error indexing cocktail 1 to Elasticsearch:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('search', () => {
    it('should run multi_match query and map hits to sources', async () => {
      const mockEsResult = {
        hits: {
          hits: [
            { _source: { id: 1, title: 'Mojito' } },
            { _source: { id: 2, title: 'Nojito' } },
          ],
        },
      };
      mockSearch.mockResolvedValue(mockEsResult);

      const results = await service.search('mojito');

      expect(results).toEqual([
        { id: 1, title: 'Mojito' },
        { id: 2, title: 'Nojito' },
      ]);
      expect(mockSearch).toHaveBeenCalledWith({
        index: 'cocktails',
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: 'mojito',
                  fields: ['title', 'description'],
                  fuzziness: 'AUTO',
                  boost: 2,
                },
              },
              {
                multi_match: {
                  query: 'mojito',
                  fields: ['title', 'description'],
                  type: 'phrase_prefix',
                  boost: 1,
                },
              },
            ],
          },
        },
      });
    });

    it('should throw error if search fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      mockSearch.mockRejectedValue(new Error('Search failed'));

      await expect(service.search('mojito')).rejects.toThrow('Search failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Elasticsearch search error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});
