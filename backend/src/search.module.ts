import { Global, Module } from '@nestjs/common';
import { ElasticSearch } from './elasticsearch.service';

@Global()
@Module({
  providers: [ElasticSearch],
  exports: [ElasticSearch],
})
export class SearchModule {}
