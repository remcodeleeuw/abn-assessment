import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CocktailsService } from './cocktails.service';
import { CocktailsController } from './cocktails.controller';
import { Cocktails } from './cocktails.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cocktails])],
  providers: [CocktailsService],
  controllers: [CocktailsController],
})
export class CocktailsModule {}
