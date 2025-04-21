import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

/* Services */
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

/* Modules */
import { UsersModule } from '../users/users.module';

/* Controllers */
import { AuthController } from './auth.controller';

/* entity */
import { Users } from 'src/users/users.entity';

require('dotenv').config();

@Module({
    imports: [
        TypeOrmModule.forFeature([Users]),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET
        }),
    ],
    providers: [AuthService, UsersService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {

}

