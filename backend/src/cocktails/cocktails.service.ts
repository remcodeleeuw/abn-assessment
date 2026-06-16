import { Injectable, NotFoundException, OnModuleInit, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Cocktails } from './cocktails.entity';
import { ElasticSearch } from '../elasticsearch.service';

@Injectable()
export class CocktailsService implements OnModuleInit {
  constructor(
    @InjectRepository(Cocktails)
    private usersRepository: Repository<Cocktails>,
    private readonly elasticSearch: ElasticSearch,
  ) { }

  async onModuleInit() {
    try {
      const dbCount = await this.usersRepository.count();
      const esCount = await this.elasticSearch.getDocumentCount('cocktails');

      if (dbCount !== esCount) {
        console.log(`Synchronization mismatch: PostgreSQL has ${dbCount} cocktails, Elasticsearch has ${esCount}. Synchronizing...`);
        const cocktails = await this.usersRepository.find();
        for (const cocktail of cocktails) {
          await this.elasticSearch.indexCocktail(cocktail);
        }
        console.log(`Successfully indexed ${cocktails.length} cocktails.`);
      } else {
        console.log(`Elasticsearch index is in sync with database (contains ${esCount} items). Skipping startup sync.`);
      }
    } catch (error) {
      console.error('Failed to run initial Elasticsearch synchronization:', error);
    }
  }

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

  async create(cocktail: Cocktails) {
    const result = await this.usersRepository.insert(cocktail);
    const insertedId = result.identifiers[0]?.id;
    if (insertedId) {
      const newCocktail = { ...cocktail, id: insertedId };
      try {
        await this.elasticSearch.indexCocktail(newCocktail);
      } catch (esError) {
        console.warn(`Failed to index new cocktail in Elasticsearch: ${esError.message}`);
      }
    }
    return result;
  }

  async search(query: string): Promise<Cocktails[]> {
    let esResults: Cocktails[] = [];
    try {
      esResults = await this.elasticSearch.search(query);
    } catch (error) {
      console.warn(`Elasticsearch search failed: ${error.message}. Trying database fallback...`);
    }

    return esResults;
  }

}