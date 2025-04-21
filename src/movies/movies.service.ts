import { Injectable, HttpException, HttpStatus, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { map, catchError } from 'rxjs/operators';

import { Movies } from './movies.entity';
import { CreateMovieDTO, MoviesDTO } from './movies.dto';

import { Community } from 'src/community/community.entity';
import { CommunityService } from 'src/community/community.service';

/* Constants */
import * as MessagesConstants from '../constants/messages.constants';


@Injectable()
export class MovieService {
    constructor(
        @InjectRepository(Movies)
        private movieRepository: Repository<Movies>,

        private communtiyService: CommunityService
    ) { }

    async findAllCount(): Promise<any> {
        let [movies, count] = await this.movieRepository.findAndCount({
            where: { watched_on: null }
        });

        return count;
    }

    async findAllByPage(page: number): Promise<Movies[]> {
        return await this.movieRepository.find({
            where: {
                watched_on: null
            },
            take: 16,
            skip: (page - 1) * 16
        });
    }


    async findAllByUnWatched(): Promise<Movies[]> {
        return await this.movieRepository.find({
            where: {
                watched_on: null
            },
        });
    }

    async findById(movie_id: string): Promise<Movies> {
        return this.movieRepository.findOne({
            where: { movie_id },
        });
    }

    async add(movie: any): Promise<any> {
        const { movie_id, community, user } = movie;

        if (!movie_id || !community) {
            throw new HttpException(MessagesConstants.COMMUNITY_MISSING_IDS_MESSAGE, HttpStatus.NOT_ACCEPTABLE);
        }

        const foundCommunity = await this.communtiyService.findCommunity(community);

        if (!foundCommunity) {
            throw new HttpException(MessagesConstants.COMMUNITY_NOT_FOUND_MESSAGE, HttpStatus.NOT_FOUND);
        }

        const foundUserInCommunity = foundCommunity.members.some((m) => m.id === user);

        if (!foundUserInCommunity) {
            throw new HttpException(MessagesConstants.COMMUNITY_USER_NOT_IN_COMMUNITY_MESSAGE, HttpStatus.NOT_ACCEPTABLE);
        }

        const isMovieAlreadyAdded = foundCommunity.movies?.some((m) => m.movie_id === movie_id);

        if (isMovieAlreadyAdded) {
            throw new HttpException(MessagesConstants.COMMUNITY_MOVIE_ALREADY_ADDED_MESSAGE, HttpStatus.FOUND);
        }

        try {
            const savedMovie = this.movieRepository.create({ ...movie });
            foundCommunity.movies = foundCommunity.movies || [];
            foundCommunity.movies.push(savedMovie);

            await this.communtiyService.update(foundCommunity);

            return { message: MessagesConstants.COMMUNITY_MOVIE_ADDED, status: HttpStatus.ACCEPTED };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(MessagesConstants.UNEXPECTED_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

    }

    async remove(id: number): Promise<void> {
        await this.movieRepository.delete(id);
    }

    async watched(movie: MoviesDTO): Promise<Movies> {

        return await this.movieRepository.save({ ...movie, id: Number(movie.id), watched_on: new Date() });
    }
}
