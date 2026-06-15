import { Injectable } from '@nestjs/common';


import { Client as EsClient } from '@elastic/elasticsearch';


@Injectable()
export class ElasticSearch {

  private client: EsClient;

  constructor(
  ) {
    this.client = new EsClient({ node: process.env.ELASTICSEARCH_HOST });
    this.checkConnection();
  }

  async checkConnection() {
    try {
      const isAlive = await this.client.ping();
      console.log('Elasticsearch cluster is up and running:', isAlive);
    } catch (error) {
      console.error('Elasticsearch cluster is down!', error);
    }
  }

}