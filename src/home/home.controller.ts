
import { Body, Controller, Get, HttpStatus, Post, Render, Res, Param, Patch, Put } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

/* Services */

/* DTOS */



@Controller('')
export class HomeController {
    constructor() { }
    @ApiExcludeEndpoint()
    @Get('/')
    @Render('home/index')
    async index(@Res() res: Response): Promise<any> { }

}
