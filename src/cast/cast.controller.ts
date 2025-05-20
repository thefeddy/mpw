/* NestJS & Express */
import { Body, Controller, Get, HttpStatus, Post, Render, Res, Param, Patch, Put, UseGuards, Request, Inject, Injectable } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';

/* Guards */
import { AuthGuard } from 'src/auth/guards/auth.guard';

/* Services */

/* DTO */
import { CreateMovieDTO } from './cast.dto';
/* Redis */
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiTags('Cast')
@Controller('')

/**
 * Controller class for handling movie-related requests.
 */
export class CastController {
    constructor(
        private http: HttpService,
        @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) { }

    @Get('/:id')
    async movie(@Param('id') id: string, @Res() res: Response): Promise<any> {
        const cacheKey = `cast-${id}`;
        let data = await this.cacheService.get<{ name: string }>(cacheKey);

        if (data) {
            try {
                const details = { ...data };
                console.log(details);
                return res.status(HttpStatus.OK).json({ details });
            } catch (internalError) {
                // Handle errors related to internal data processing or database
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error', details: internalError.message });
            }
        }

        try {
            // Fetch data from the external API
            const { data: fetchedData } = await firstValueFrom(
                this.http.get(`${process.env.TMDB_BASE_URL}person/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=watch%2Fproviders,videos,images,credits,trailers`)
            );

            // Save fetched data to cache and construct the details object
            await this.cacheService.set(cacheKey, fetchedData);

            console.log(fetchedData)

            const details = { ...fetchedData };

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

}
