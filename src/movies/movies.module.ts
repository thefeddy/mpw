import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HttpModule } from '@nestjs/axios'

import { MoviesController } from './movies.controller';

import { MovieService } from './movies.service';
import { CommunityService } from 'src/community/community.service';
import { UsersService } from 'src/users/users.service';

import { Movies } from './movies.entity';
import { Community } from 'src/community/community.entity';
import { Users } from 'src/users/users.entity';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([Movies]),
        TypeOrmModule.forFeature([Community]),
        TypeOrmModule.forFeature([Users])
    ],
    providers: [MovieService, CommunityService, UsersService],
    controllers: [MoviesController],
})

export class MoviesModule { }
