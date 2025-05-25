/* NestJS */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule, Routes } from '@nestjs/core';

/* App */
import { AppController } from './app.controller';
import { AppService } from './app.service';

/* Modules */
import { HomeModule } from './home/home.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { CommunityModule } from './community/community.module';
import { UsersModule } from './users/users.module';
import { SearchModule } from './search/search.module';

/* Entities */
import { Users } from './users/users.entity';
import { Community } from './community/community.entity';
import { Media } from './media/media.entity';

/* Redis */
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { CastModule } from './cast/cast.module';


/* Routes */
const routes: Routes = [
    {
        path: '/',
        module: HomeModule,
    },
    {
        path: '/api/',
        children: [
            {
                path: '/auth/',
                module: AuthModule,
            },
            {
                path: '/community/',
                module: CommunityModule,
            },
            {
                path: '/media/',
                module: MediaModule,
            },
            {
                path: '/user/',
                module: UsersModule,
            },
            {
                path: '/search/',
                module: SearchModule,
            },
            {
                path: '/cast/',
                module: CastModule,
            },
        ]
    }
];

@Module({
    imports: [
        HomeModule,
        AuthModule,
        CommunityModule,
        MediaModule,
        UsersModule,
        SearchModule,
        CastModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: 'postgres',
                host: process.env.TYPEORM_HOST,
                port: Number(process.env.TYPEORM_PORT),
                username: process.env.TYPEORM_USERNAME,
                password: process.env.TYPEORM_PASSWORD,
                database: process.env.TYPEORM_DATABASE,
                entities: [Users, Community, Media],
                synchronize: true,
            }),
        }),
        CacheModule.register({
            isGlobal: true,
            store: redisStore,
            host: 'localhost',
            port: 6379,
        }),
        RouterModule.register(routes)
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
