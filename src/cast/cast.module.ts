import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HttpModule } from '@nestjs/axios'

import { CastController } from './cast.controller';

import { CastService } from './cast.service';


@Module({
    imports: [
        HttpModule
    ],
    providers: [CastService],
    controllers: [CastController],
})

export class CastModule { }
