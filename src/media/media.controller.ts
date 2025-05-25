/* NestJS & Express */
import { Body, Controller, Get, HttpStatus, Post, Render, Res, Param, Patch, Put, UseGuards, Request, Inject, Injectable } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';

/* Guards */
import { AuthGuard } from 'src/auth/guards/auth.guard';

/* Services */
import { MediaService } from './media.service';

/* DTO */
import { CreateMovieDTO } from './media.dto';
/* Redis */
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';



@ApiTags('Movies')
@Controller('')
/**
 * Controller class for handling movie-related requests.
 */
export class MediaController {
    constructor(
        private mediaService: MediaService,
        private http: HttpService,
        @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) { }

    @Get('/details/:type/:id/')
    async media(@Param('type') type: string, @Param('id') id: string, @Res() res: Response): Promise<any> {
        const cacheKey = `${type}-${id}`;
        let data = await this.cacheService.get<{ name: string }>(cacheKey);

        if (data) {
            // If data is already in cache, use it directly
            try {
                const detail = await this.mediaService.findById(id);
                const details = { ...data, detail };

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
            const detail = await this.mediaService.findById(id);
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

    @Get('/season/:id/:season/')
    async season(@Param('id') id: string, @Param('season') season: string, @Res() res: Response): Promise<any> {
        const cacheKey = `season-${id}-${season}`;
        let data = await this.cacheService.get<{ name: string }>(cacheKey);

        if (data) {
            // If data is already in cache, use it directly
            try {
                const details = { ...data };

                return res.status(HttpStatus.OK).json({ details });
            } catch (internalError) {
                // Handle errors related to internal data processing or database
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error', details: internalError.message });
            }
        }

        try {
            const { data: fetchedData } = await firstValueFrom(
                this.http.get(`${process.env.TMDB_BASE_URL}tv/${id}/season/${season}?api_key=${process.env.TMDB_API_KEY}&language=en-US&append_to_response=watch%2Fproviders,videos,images,trailers`)
            );

            const totalEpisodes = fetchedData?.episodes?.length || 1;
            const randomEpisode = Math.floor(Math.random() * totalEpisodes) + 1;

            const { data: imageData } = await firstValueFrom(
                this.http.get(`${process.env.TMDB_BASE_URL}tv/${id}/season/${season}/episode/${randomEpisode}/images?api_key=${process.env.TMDB_API_KEY}`)
            );

            console.log(imageData);
            const details = { ...fetchedData, ...imageData };
            await this.cacheService.set(cacheKey, details);

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
}
