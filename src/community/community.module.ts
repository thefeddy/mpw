import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'

import { CommunityController } from './community.controller';

import { Community } from './community.entity';

import { CommunityService } from './community.service';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/users.entity';
import { MovieService } from 'src/movies/movies.service';
import { Movies } from 'src/movies/movies.entity';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([Community]),
        TypeOrmModule.forFeature([Users]),
        TypeOrmModule.forFeature([Movies]),
    ],
    providers: [CommunityService, UsersService, MovieService],
    controllers: [CommunityController],
})

export class CommunityModule { }
