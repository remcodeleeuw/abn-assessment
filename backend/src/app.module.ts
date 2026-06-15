import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cocktails } from './cocktails/cocktails.entity';
import { CocktailsModule } from './cocktails/cocktails.module';
import { ElasticSearch } from './elasticsearch.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      url: process.env.DATABASE_URL,
      type: 'postgres',
      logging: true,
      entities: [Cocktails],
    }),
    CocktailsModule,
  ],
  providers: [ElasticSearch]
})
export class AppModule {}
