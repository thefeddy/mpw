import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { Users } from './users.entity';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';

import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([Users]), forwardRef(() => AuthModule)],
    providers: [UsersService],
    controllers: [UsersController],
})

export class UsersModule { }
