import { Body, Controller, Get, HttpStatus, Post, Render, Res, Param, Patch, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios'

import { firstValueFrom } from 'rxjs';

import { Response } from 'express';


@ApiTags('Search')
@Controller('')
export class SearchController {
    constructor(
        private http: HttpService
    ) { }

    @Get('/:type/:search/:page/')
    async search(@Param('type') type: string, @Param('search') search: string, @Param('page') page: string, @Res() res: Response): Promise<any> {
        const url = `${process.env.TMDB_BASE_URL}search/${type}?api_key=${process.env.TMDB_API_KEY}&language=en-US&query=${search}&page=${page}&include_adult=false`;
        const results = await firstValueFrom(this.http.get(url));
        const pagination = {
            total: results.data.total_pages,
            current: results.data.page
        }

        res.status(HttpStatus.OK).json({ results: results.data, search, pagination });
    }
}
