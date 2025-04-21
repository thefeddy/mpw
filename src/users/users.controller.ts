import { Body, Controller, Get, HttpStatus, Post, Render, Res, Param, Patch, Put, HttpCode, UseGuards, Request } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Response } from 'express';

import { UsersService } from './users.service';

import { CreateUserDTO, UpdateUserDTO, UserLoginDTO } from './users.dto';
import { ResponseDTO } from 'src/dtos/response.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('Users')
@Controller('')
export class UsersController {
    constructor(
        private usersService: UsersService
    ) {

    }


    @ApiOperation({ summary: 'Create User' })
    @Post('/create')
    async create(@Body() user: CreateUserDTO): Promise<any> {
        return this.usersService.createUser(user);
    }


    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'List all communities that current user is in.' })
    @Get('/profile')
    async profile(
        @Res() res: Response,
        @Request() req: any
    ): Promise<any> {

        const foundUser = await this.usersService.profile(req?.user.id);
        res.status(HttpStatus.OK).json(foundUser);

    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'List all communities that supplied user is in.' })
    @Get('/profile/:id/')
    async profileByID(
        @Res() res: Response,
        @Request() req: any
    ): Promise<any> {
        const foundUser = await this.usersService.profile(req?.params.id);
        res.status(HttpStatus.OK).json(foundUser);
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Updated User' })
    @Patch('/update/')
    async update(
        @Body() user: UpdateUserDTO,
        @Res() res: Response,
        @Request() req: any
    ): Promise<any> {
        const updatedUser = await this.usersService.update(user, req?.user.email);

        res.status(updatedUser.status).json(updatedUser);
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Deactivate User' })
    @Patch('/deactivate/')
    async deactivate(
        @Res() res: Response,
        @Request() req: any
    ): Promise<any> {

        res.status(HttpStatus.OK).json();
    }
}
