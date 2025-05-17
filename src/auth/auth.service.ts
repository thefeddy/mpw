import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as crypto from 'crypto';

/* DTOs */
import { UserLoginDTO } from 'src/users/users.dto';

/* Services */
import { UsersService } from '../users/users.service';

/* Constants */
import * as MessagesConstants from '../constants/messages.constants';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async validateToken(token: string) {
        try {
            const decoded = await this.jwtService.verifyAsync(token);
            return decoded;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async login(credentials: UserLoginDTO, login: boolean): Promise<{ access_token: string }> {
        login = login || false;
        if (!credentials.email) {
            throw new BadRequestException('Email is required');
        }

        // Check if the user exists
        const foundUser = await this.usersService.findUserByEmail(credentials.email);

        console.log(credentials)

        if (!foundUser) {
            throw new UnauthorizedException(MessagesConstants.USER_NOT_FOUND);
        }

        // Verify the password
        let isPasswordValid: boolean;
        if (!login) {
            const hash = await this.hashPassword(credentials.password);
            isPasswordValid = await this.comparePassword(credentials.password, hash);
        } else {
            isPasswordValid = true;
        }


        if (!isPasswordValid) {
            throw new UnauthorizedException(MessagesConstants.INVALID_PASSWORD);
        }

        if (foundUser.deactivated) {
            throw new UnauthorizedException(MessagesConstants.ACCOUNT_DEACTIVATED);
        }


        // Remove sensitive info from JWT
        delete foundUser.password;
        delete foundUser.deactivated;

        // Generate and return the access token
        const payload = { email: foundUser.email, id: foundUser.id, display_name: foundUser.display_name, expiresIn: (credentials.remember) ? '60d' : '1d' };
        const access_token = await this.jwtService.signAsync(payload);
        return { access_token };
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        const hash = crypto.pbkdf2Sync(password, process.env.SALT, 10000, 64, 'sha512').toString('hex');
        return hash === hashedPassword;
    }

    async hashPassword(password: string): Promise<string> {
        const hash = crypto.pbkdf2Sync(password, process.env.SALT, 10000, 64, 'sha512').toString('hex');
        return hash;
    }
}