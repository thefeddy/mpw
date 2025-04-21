import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';


import { CreateCommunityDTO, JoinCommunityDTO } from './community.dto';

import { Community } from './community.entity';

import { UsersService } from 'src/users/users.service';
import { ResponseDTO } from 'src/dtos/response.dto';

/* Constants */
import * as MessagesConstants from '../constants/messages.constants';


@Injectable()
export class CommunityService {

    constructor(
        @InjectRepository(Community)
        private communityRepository: Repository<Community>,
        private userService: UsersService
    ) { }

    async findCommunity(id: number): Promise<any> {

        return await this.communityRepository.findOneOrFail({
            where: { id },
            relations: ['owner', 'members', 'movies']
        });
    }


    async findCommunityUnWatchedVideos(id: number): Promise<any> {
        const query = await this.communityRepository.createQueryBuilder('community')
            .leftJoinAndSelect('community.movies', 'movies')
            .where('movies.watched_on IS NULL')
            .andWhere('community.id = :id', { id })
            .getOne();

        if (query) {
            return { status: HttpStatus.OK, details: query };
        } else {
            throw new HttpException(MessagesConstants.COMMUNITY_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
    }

    async findAllPublic(): Promise<any> {
        return await this.communityRepository.find({
            where: { open: true },
            relations: ['owner', 'members']
        });
    }

    async update(community: any): Promise<any> {
        try {

        } catch (error) {
            if (!(error instanceof HttpException)) {
                error = new HttpException(MessagesConstants.UNEXPECTED_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw error;
        }
    }

    async addMember(data: JoinCommunityDTO): Promise<any> {
        const { community, user, join_password } = data;
        try {
            const comm = await this.communityRepository
                .createQueryBuilder('community')
                .where("community.id = :communityId", { communityId: community })
                .leftJoinAndSelect("community.owner", "owner")
                .leftJoinAndSelect("community.members", "members")
                .addSelect(["community.join_password"])
                .getOneOrFail();

            const members = comm.members;
            const isMember = members.some((m: any) => m.id === user);

            if (isMember) {
                throw new HttpException(MessagesConstants.ALREADY_IN_COMMUNITY, HttpStatus.FOUND);
            }

            if (comm.private) {
                if (comm.join_password !== join_password) {
                    throw new HttpException(MessagesConstants.COMMUNITY_WRONG_PASSWORD, HttpStatus.FORBIDDEN);
                }
            }

            const member = await this.userService.findUser(Number(user));
            members.push(member);
            await this.communityRepository.save(comm);
            throw new HttpException(`You've joined ${comm.name}`, HttpStatus.ACCEPTED);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(MessagesConstants.COMMUNITY_MISSING_IDS_MESSAGE, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

    }

    async create(ownerId: number, { open, name }: CreateCommunityDTO) {
        try {
            const owner = await this.userService.findUser(Number(ownerId));
            if (!owner) {
                throw new HttpException(MessagesConstants.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }

            const community = this.communityRepository.create({
                owner,
                open,
                name,
                members: [owner],
            });

            const savedCommunity = await this.communityRepository.save(community);
            return { message: MessagesConstants.COMMUNITY_CREATED, data: savedCommunity, status: HttpStatus.CREATED };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(MessagesConstants.UNEXPECTED_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async leave(user: number, comm: number): Promise<ResponseDTO> {
        try {
            const member = await this.userService.findUser(user);
            const community = await this.findCommunity(comm);

            if (community.owner.id === user) {
                throw new HttpException(MessagesConstants.OWNER_CANNOT_LEAVE_COMMUNITY, HttpStatus.FORBIDDEN);
            }

            const memberIndex = community.members.findIndex((mem) => mem.id === member.id);
            if (memberIndex !== -1) {
                community.members.splice(memberIndex, 1);
                await this.communityRepository.save({ ...community });
                throw new HttpException(MessagesConstants.LEFT_COMMUNITY_SUCCESS, HttpStatus.ACCEPTED);
            } else {
                throw new HttpException(MessagesConstants.USER_NOT_IN_COMMUNITY, HttpStatus.NOT_FOUND);
            }
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(MessagesConstants.UNEXPECTED_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw error;
        }
    }

    async remove(user: number, comm: number): Promise<any> {
        try {
            const member = await this.userService.findUser(user);
            const community = await this.findCommunity(comm);

            if (community.owner.id == user) {
                throw new HttpException(MessagesConstants.COMMUNITY_CANT_KICK_OWNER, HttpStatus.FORBIDDEN);
            }

            const memberIndex = community.members.findIndex((mem) => mem.id === member.id);

            if (memberIndex !== -1) {
                community.members.splice(memberIndex, 1);
                await this.communityRepository.save({ ...community });
                throw new HttpException(MessagesConstants.KICKED_USER_COMMUNITY_SUCCESS, HttpStatus.ACCEPTED);
            } else {
                throw new HttpException(MessagesConstants.USER_NOT_IN_COMMUNITY, HttpStatus.NOT_FOUND);
            }
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(MessagesConstants.UNEXPECTED_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw error;
        }
    }
}