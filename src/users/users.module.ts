import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { Users } from './users.entity';
import { UsersService } from './users.service';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([Users])],
    providers: [UsersService],
    controllers: [UsersController],
})

export class UsersModule { }
