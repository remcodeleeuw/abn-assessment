import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { CocktailsService } from './cocktails.service';
import { Cocktails } from './cocktails.entity';
import { SearchModule } from '../search.module';
import { ElasticSearch } from '../elasticsearch.service';

jest.setTimeout(60000);

describe('CocktailsService Integration (Fully Isolated with Testcontainers)', () => {
  let service: CocktailsService;
  let dataSource: DataSource;
  let elasticSearch: ElasticSearch;
  let pgContainer: StartedPostgreSqlContainer;
  let esContainer: StartedTestContainer;

  beforeAll(async () => {
    pgContainer = await new PostgreSqlContainer('postgres:13').start();
    const dbUrl = pgContainer.getConnectionUri();

    esContainer = await new GenericContainer('docker.elastic.co/elasticsearch/elasticsearch:8.6.0')
      .withExposedPorts(9200)
      .withEnvironment({
        'discovery.type': 'single-node',
        'ES_JAVA_OPTS': '-Xms512m -Xmx512m',
        'xpack.security.enabled': 'false',
        'xpack.security.http.ssl.enabled': 'false',
      })
      .withWaitStrategy(Wait.forHttp('/_cluster/health', 9200).forStatusCode(200))
      .start();

    const esHost = `http://${esContainer.getHost()}:${esContainer.getMappedPort(9200)}`;
    process.env.ELASTICSEARCH_HOST = esHost;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: dbUrl,
          entities: [Cocktails],
          synchronize: true,
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
    if (dataSource) {
      await dataSource.destroy();
    }
    if (pgContainer) {
      await pgContainer.stop();
    }
    if (esContainer) {
      await esContainer.stop();
    }
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
