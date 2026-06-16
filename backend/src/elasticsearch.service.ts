import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client as EsClient } from '@elastic/elasticsearch';
import { Cocktails } from './cocktails/cocktails.entity';

@Injectable()
export class ElasticSearch implements OnModuleInit {

  private client: EsClient;

  constructor(
  ) {
    this.client = new EsClient({ node: process.env.ELASTICSEARCH_HOST });
    this.checkConnection();
  }

  async onModuleInit() {
    await this.initIndex();
  }

  async checkConnection() {
    try {
      const isAlive = await this.client.ping();
      console.log('Elasticsearch cluster is up and running:', isAlive);
    } catch (error) {
      console.error('Elasticsearch cluster is down!', error);
    }
  }

  async getDocumentCount(indexName: string): Promise<number> {
    try {
      const countRes = await this.client.count({ index: indexName });
      return countRes.count;
    } catch (error) {
      return 0;
    }
  }

  async initIndex() {
    try {
      const exists = await this.client.indices.exists({ index: 'cocktails' });
      if (!exists) {
        await this.client.indices.create({ index: 'cocktails' });
        console.log('Created index "cocktails" in Elasticsearch');
      }
    } catch (error) {
      console.error('Error initializing index "cocktails":', error);
    }
  }

  async indexCocktail(cocktail: Cocktails) {
    try {
      await this.client.index({
        index: 'cocktails',
        id: cocktail.id.toString(),
        document: {
          id: cocktail.id,
          title: cocktail.title,
          description: cocktail.description,
          price: cocktail.price,
        },
      });
    } catch (error) {
      console.error(`Error indexing cocktail ${cocktail.id} to Elasticsearch:`, error);
    }
  }

  async search(queryText: string): Promise<any[]> {
    try {
      const result = await this.client.search({
        index: 'cocktails',
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: queryText,
                  fields: ['title', 'description'],
                  fuzziness: 'AUTO',
                  boost: 2,
                },
              },
              {
                multi_match: {
                  query: queryText,
                  fields: ['title', 'description'],
                  type: 'phrase_prefix',
                  boost: 1,
                },
              },
            ],
          },
        },
      });
      return result.hits.hits.map(hit => hit._source);
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      throw error;
    }
  }

}