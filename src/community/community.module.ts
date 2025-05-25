import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'

import { CommunityController } from './community.controller';

import { Community } from './community.entity';

import { CommunityService } from './community.service';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/users.entity';
import { MediaService } from 'src/media/media.service';
import { Media } from 'src/media/media.entity';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([Community]),
        TypeOrmModule.forFeature([Users]),
        TypeOrmModule.forFeature([Media]),
    ],
    providers: [CommunityService, UsersService, MediaService],
    controllers: [CommunityController],
})

export class CommunityModule { }
