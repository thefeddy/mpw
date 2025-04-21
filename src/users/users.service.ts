/* NestJS */
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';

/* TypeORM + PG */
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostgresError } from 'pg-error-enum';

/* Entity */
import { Users } from './users.entity';

/* DTOs */
import { CreateUserDTO, UpdateUserDTO } from './users.dto';

/* Constants */
import * as MessagesConstants from '../constants/messages.constants';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>
    ) { }

    async findUserByEmail(email: string): Promise<any> {
        return await this.userRepository.findOne({
            where: { email },
            select: ['email', 'password', 'id', 'display_name', 'deactivated']
        });
    }

    async profile(id: number): Promise<any> {
        return await this.userRepository.findOne({
            where: { id },
            relations: ['communities']
        });
    }

    async findUser(id: number): Promise<any> {
        return await this.userRepository.findOne({
            where: { id }
        });
    }

    async createUser(user: CreateUserDTO): Promise<any> {
        const member = await this.findUserByEmail(user.email);
        if (member) {
            throw new HttpException(MessagesConstants.USER_ALREADY_EXISTS, HttpStatus.FORBIDDEN);
        } else {
            try {
                const newUser = this.userRepository.create(user);
                await this.userRepository.save(newUser);
                return new HttpException(MessagesConstants.USER_ADDED_SUCCESS, HttpStatus.ACCEPTED);
            } catch (error) {
                if (error.code === PostgresError.UNIQUE_VIOLATION) {
                    throw new HttpException(MessagesConstants.DUPLICATE_DISPLAY_NAME, HttpStatus.CONFLICT);
                }
                // Handle other errors or rethrow if necessary
                throw new HttpException(MessagesConstants.UNEXPECTED_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async update(user: UpdateUserDTO, email: string): Promise<any> {
        const member = await this.findUserByEmail(email);

        if (!member) {
            throw new HttpException(MessagesConstants.USER_NOT_FOUND, HttpStatus.FORBIDDEN);
        } else {
            try {

                member.first_name = user.first_name;
                member.last_name = user.last_name;
                member.discord_id = user.discord_id;

                await this.userRepository.save(member);

            } catch (error) {
                if (error.code === PostgresError.UNIQUE_VIOLATION) {
                    throw new HttpException(MessagesConstants.DUPLICATE_DISPLAY_NAME, HttpStatus.CONFLICT);
                }
                // Handle other errors or rethrow if necessary
                throw new HttpException(MessagesConstants.UNEXPECTED_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        throw new HttpException(MessagesConstants.USER_UPDATED_SUCCESS, HttpStatus.ACCEPTED);
    }
}