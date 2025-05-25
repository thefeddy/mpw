import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HttpModule } from '@nestjs/axios'

import { MediaController } from './media.controller';

import { MediaService } from './media.service';
import { CommunityService } from 'src/community/community.service';
import { UsersService } from 'src/users/users.service';

import { Media } from './media.entity';
import { Community } from 'src/community/community.entity';
import { Users } from 'src/users/users.entity';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([Media]),
        TypeOrmModule.forFeature([Community]),
        TypeOrmModule.forFeature([Users])
    ],
    providers: [MediaService, CommunityService, UsersService],
    controllers: [MediaController],
})

export class MediaModule { }
