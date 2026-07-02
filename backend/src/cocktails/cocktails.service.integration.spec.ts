import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CocktailsService } from './cocktails.service';
import { Cocktails } from './cocktails.entity';
import { SearchModule } from '../search.module';
import { ElasticSearch } from '../elasticsearch.service';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/mydatabase';
process.env.ELASTICSEARCH_HOST = process.env.ELASTICSEARCH_HOST || 'http://localhost:9200';

describe('CocktailsService Integration', () => {
  let service: CocktailsService;
  let dataSource: DataSource;
  let elasticSearch: ElasticSearch;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: process.env.DATABASE_URL,
          entities: [Cocktails],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([Cocktails]),
        SearchModule,
      ],
      providers: [CocktailsService],
    }).compile();

    service = module.get<CocktailsService>(CocktailsService);
    dataSource = module.get<DataSource>(DataSource);
    elasticSearch = module.get<ElasticSearch>(ElasticSearch);

    await elasticSearch.initIndex();
  });

  beforeEach(async () => {
    await dataSource.getRepository(Cocktails).clear();

    try {
      await elasticSearch['client'].deleteByQuery({
        index: 'cocktails',
        query: {
          match_all: {},
        },
        refresh: true,
      });
    } catch (error) {
    }
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should save a cocktail in database and index it in Elasticsearch', async () => {
    const cocktailPayload = {
      title: 'Whiskey Sour',
      description: 'Classic sour cocktail with whiskey, lemon juice, and sugar',
      price: 11,
    } as Cocktails;

    const result = await service.create(cocktailPayload);
    const insertedId = result.identifiers[0]?.id;
    expect(insertedId).toBeDefined();

    const dbCocktail = await dataSource.getRepository(Cocktails).findOneBy({ id: insertedId });
    expect(dbCocktail).toBeDefined();
    expect(dbCocktail.title).toBe('Whiskey Sour');
    expect(dbCocktail.price).toBe(11);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    const esResults = await service.search('whiskey');
    expect(esResults).toHaveLength(1);
    expect(esResults[0].title).toBe('Whiskey Sour');
    expect(esResults[0].id).toBe(insertedId);
  });

  it('should support searching by description and title in integration flow', async () => {
    const c1 = { title: 'Gin Tonic', description: 'Fresh tonic with gin', price: 10 } as Cocktails;
    const c2 = { title: 'Negroni', description: 'Sweet vermouth, gin and campari', price: 12 } as Cocktails;

    const r1 = await service.create(c1);
    const r2 = await service.create(c2);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    const searchGin = await service.search('gin');
    expect(searchGin.length).toBe(2);

    const searchTonic = await service.search('tonic');
    expect(searchTonic.length).toBe(1);
    expect(searchTonic[0].id).toBe(r1.identifiers[0].id);
  });
});
