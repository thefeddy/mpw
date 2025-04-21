import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'

import { SearchController } from './search.controller';

@Module({
    imports: [
        HttpModule,
    ],
    providers: [],
    controllers: [SearchController],
})

export class SearchModule { }
