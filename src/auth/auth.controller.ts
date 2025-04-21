import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { UserLoginDTO } from 'src/users/users.dto';


@ApiTags('Auth')
@Controller('')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() user: UserLoginDTO) {
        return this.authService.login(user);
    }
}