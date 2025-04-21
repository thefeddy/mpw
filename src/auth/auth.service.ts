import { Injectable, UnauthorizedException } from '@nestjs/common';
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

    async login(credentials: UserLoginDTO): Promise<{ access_token: string }> {
        // Check if the user exists
        const foundUser = await this.usersService.findUserByEmail(credentials.email);

        if (!foundUser) {
            throw new UnauthorizedException(MessagesConstants.USER_NOT_FOUND);
        }

        // Verify the password
        const hash = await this.hashPassword(credentials.password);
        const isPasswordValid = await this.comparePassword(credentials.password, hash);

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