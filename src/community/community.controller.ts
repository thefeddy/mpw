import { Body, Controller, Get, HttpStatus, Post, Res, Param, Patch, UseGuards, Req, Delete, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
/* Guards */
import { AuthGuard } from 'src/auth/guards/auth.guard';

/* DTOS */
import { CreateCommunityDTO, JoinCommunityDTO } from './community.dto';

/* Services */
import { CommunityService } from './community.service';
import { MovieService } from '../movies/movies.service';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { AllowAny } from '../auth/decorator/allow-any.decorator';
import { AllowAnyGuard } from '../auth/guards/allow-any.guard';


@ApiTags('Communities')
@Controller('')
export class CommunityController {
    constructor(
        private communityService: CommunityService,
        private movieService: MovieService,
        private http: HttpService,
        @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) { }


    @Get('')
    //@AllowAny()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'List All Public Communities' })
    async getCommunities(@Req() req: any) {
        let communities = await this.communityService.findAllPublic();
        for (const community of communities) {
            if (req?.user) {
                const isMember = community.members.find(member => member.id === req?.user.id);
                let isOwner = community.owner.id === req?.user.id;
                community.isMember = isMember ? true : false;
                community.isOwner = isOwner;
            } else {
                community.isMember = false;
                community.isOwner = false;
            }
        }
        return communities;
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Create a community' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Community created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request data' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    @Post('create')
    async createCommunity(@Body() communityPayload: CreateCommunityDTO, @Req() req: any, @Res() res: Response): Promise<any> {
        let message = await this.communityService.create(req?.user.id, communityPayload);

        res.status(message.status).json(message);
    }

    @AllowAny()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get community By Id' })
    @ApiResponse({ status: HttpStatus.FOUND, description: 'Community found successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request data' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    @Get(':id/')
    async getCommunity(@Param('id') id: number, @Req() req: any, @Res() res: Response): Promise<any> {


        let message = await this.communityService.findCommunity(id);

        const isMember = message.members.find(member => member.id === req?.user.id);
        let isOwner = message.owner.id === req?.user.id;
        message.isMember = isMember ? true : false;
        message.isOwner = isOwner;
        for (const movie of message.movies) {
            const cacheKey = `movie-${movie.movie_id}`;
            let data = await this.cacheService.get<{ name: string }>(cacheKey);
            if (!data) {
                const { data: fetchedData } = await firstValueFrom(
                    this.http.get(`${process.env.TMDB_BASE_URL}movie/${movie.movie_id}?api_key=${process.env.TMDB_API_KEY}&language=en-US&append_to_response=videos,images,credits,trailers`)
                );
                await this.cacheService.set(cacheKey, fetchedData);

                data = fetchedData;

            }

            movie.details = data;
        }
        res.status(200).json(message);
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Update a community' })
    @Patch('update')
    async updateCommunity() {
        //this.communityService.create();
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Join a community' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Already a member of the community' })
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Successfully joined the community' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Incorrect community password' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Community not found' })
    @Patch('join/:id/')
    async joinCommunity(@Body() communityPayload: JoinCommunityDTO, @Res() res: Response, @Req() req: any): Promise<any> {
        let data = {
            user: req?.user.id,
            community: req.params.id,
            join_password: communityPayload.join_password
        }

        let message = await this.communityService.addMember(data);
        res.status(message.status).json(message);
    }


    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Leave a community' })
    @ApiResponse({ status: HttpStatus.OK, description: 'User successfully left the community' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Owner cannot leave the community' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found in the community' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Unexpected error occurred' })
    @Delete('leave/:id/')
    async leaveCommunity(@Res() res: Response, @Req() req: any): Promise<any> {

        let message = await this.communityService.leave(req?.user.id, req.params.id);

        res.status(message.status).json(message);
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Leave a community' })
    @ApiResponse({ status: HttpStatus.OK, description: 'User successfully left the community' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Owner cannot leave the community' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found in the community' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Unexpected error occurred' })
    @Delete('kick/:community/:id/')
    async removeMember(@Res() res: Response, @Req() req: any): Promise<any> {
        let message = await this.communityService.remove(req.params.community, req.params.id);

        res.status(message.status).json(message);
    }


    @UseGuards(AuthGuard)
    @Get('/:id/list/')
    async listMovies(@Param('id') id: string, @Res() res: Response, @Req() req: any): Promise<any> {
        let foundMovies = await this.communityService.findCommunityUnWatchedVideos(req?.params.id);
        let movies = [];

        for (const movie of foundMovies.details.movies) {
            let detail = await firstValueFrom(this.http.get(`${process.env.TMDB_BASE_URL}movie/${movie.movie_id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`));
            movie.details = detail.data;
        }


        res.status(foundMovies.status).json(foundMovies);
    }

}
