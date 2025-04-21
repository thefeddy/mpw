/* NestJS & Express */
import { Body, Controller, Get, HttpStatus, Post, Render, Res, Param, Patch, Put, UseGuards, Request, Inject, Injectable } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';

/* Guards */
import { AuthGuard } from 'src/auth/guards/auth.guard';
/* Services */
import { MovieService } from './movies.service';

/* DTO */
import { CreateMovieDTO } from './movies.dto';
/* Redis */
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiTags('Movies')
@Controller('')
/**
 * Controller class for handling movie-related requests.
 */
export class MoviesController {
    constructor(
        private movieService: MovieService,
        private http: HttpService,
        @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) { }

    @Get('/search/:type/:search/:page')
    /**
     * Search for movies based on the provided search query and page number.
     * @param search - The search query.
     * @param page - The page number.
     * @param res - The response object.
     * @returns A Promise that resolves to the search results.
     */
    async search(@Param('search') search: string, @Param('page') page: string, @Res() res: Response): Promise<any> {
        const url = `${process.env.TMDB_BASE_URL}search/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&query=${search}&page=${page}&include_adult=false&append_to_response=videos,images,credits,trailers,genres`;
        const movies = await firstValueFrom(this.http.get(url));
        const pagination = {
            total: movies.data.total_pages,
            current: movies.data.page
        }

        res.status(HttpStatus.OK).json({ movies: movies.data, search, pagination });
    }
    TODO: 'Move this out of the controller';
    @Get('/details/:type/:id/')
    async movie(@Param('type') type: string, @Param('id') id: string, @Res() res: Response): Promise<any> {
        const cacheKey = `${type}-${id}`;
        let data = await this.cacheService.get<{ name: string }>(cacheKey);

        if (data) {
            // If data is already in cache, use it directly
            try {
                const detail = await this.movieService.findById(id);
                const details = { ...data, detail };

                console.log(detail);
                return res.status(HttpStatus.OK).json({ details });
            } catch (internalError) {
                // Handle errors related to internal data processing or database
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error', details: internalError.message });
            }
        }

        try {
            // Fetch data from the external API
            const { data: fetchedData } = await firstValueFrom(
                this.http.get(`${process.env.TMDB_BASE_URL}${type}/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US&append_to_response=watch%2Fproviders,videos,images,credits,trailers`)
            );



            const background = await (fetchedData?.backdrop_path != null) ? fetchedData.backdrop_path : fetchedData.poster_path;
            fetchedData.background = background;

            fetchedData.streams = fetchedData['watch/providers'].results.US;
            delete fetchedData['watch/providers'];


            // Save fetched data to cache and construct the details object
            await this.cacheService.set(cacheKey, fetchedData);
            const detail = await this.movieService.findById(id);


            console.log(fetchedData)

            const details = { ...fetchedData, detail };

            res.status(HttpStatus.OK).json({ details });
        } catch (error) {
            if (error.response) {
                // Handle errors from the TMDB API specifically
                const status = error.response.status;
                const message = error.response.data.status_message || 'Error communicating with TMDB';
                return res.status(status).json({ error: message });
            } else if (error.request) {
                // Handle network errors
                return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ error: 'Service Unavailable - Unable to reach TMDB' });
            } else {
                // Handle unexpected errors
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error', details: error.message });
            }
        }
    }


    @Get('/trending/')
    async trending(@Param('id') id: string, @Res() res: Response): Promise<any> {
        const response =
            await firstValueFrom(
                this.http.get(`${process.env.TMDB_BASE_URL}trending/movie/week?api_key=${process.env.TMDB_API_KEY}`)
            );

        res.status(HttpStatus.OK).json(response?.data);
    }

    @Get('/genres/')
    async genres(@Res() res: Response): Promise<any> {

        const cacheKey = `genres`;
        let data = await this.cacheService.get<{ name: string }>(cacheKey);
        if (!data) {

            const { data: fetchedData } = await firstValueFrom(
                this.http.get(`${process.env.TMDB_BASE_URL}genre/movie/list?api_key=${process.env.TMDB_API_KEY}`)
            );

            await this.cacheService.set(cacheKey, fetchedData, { ttl: 864000 } as any);  // 10 days - this is just genres dont really need to call it more than once a week
            data = fetchedData;
        }

        res.status(HttpStatus.OK).json(data);
    }

    @UseGuards(AuthGuard)
    @Post('/add/:id/:movie_id')
    @ApiResponse({ status: 201, description: 'This movie has been added to your list' })
    @ApiResponse({ status: 302, description: 'This movie is already in your list' })
    @ApiResponse({ status: 406, description: 'Not Acceptable' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async create(
        @Body() movie: CreateMovieDTO,
        @Res() res: Response,
        @Request() req: any
    ): Promise<any> {

        let data = {
            movie_id: req?.params.id,
            community: req?.params.movie_id,
            user: req?.user.id
        }
        let message = await this.movieService.add(data);

        res.status(message.status).json(message);
    }
}
