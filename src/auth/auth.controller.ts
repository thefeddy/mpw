import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Request, Req, UnauthorizedException } from '@nestjs/common';
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
        return this.authService.login(user, false);
    }

    @Post('validate-token')
    async validateToken(@Req() req): Promise<any> {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.split(' ')[1];

        const decoded = await this.authService.validateToken(token);

        return {
            valid: true,
            user: decoded,
        };
    }

}