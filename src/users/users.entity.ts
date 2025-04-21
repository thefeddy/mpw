import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    Unique,
    Index,
    BeforeInsert,
    OneToMany,
    ManyToOne,
    ManyToMany,
} from 'typeorm';


/* Return Objects */
import { UsersRO } from './users.ro';
import { Community } from 'src/community/community.entity';

import * as crypto from 'crypto';


export const UNIQUE_USER_DISPLAY_NAME = 'unique_user_display_name';
export const UNIQUE_USER_DISCORD = 'unique_user_discord';

@Entity()
@Unique(UNIQUE_USER_DISPLAY_NAME, ['display_name'])
@Unique(UNIQUE_USER_DISCORD, ['discord_id'])
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'email',
        type: 'varchar',
        select: false,
        unique: true
    })
    email: string;

    @Column({
        name: 'password',
        type: 'varchar',
        select: false
    })
    password: string;

    @Column({ default: new Date() })
    joined: Date;

    // @Column({ nullable: true })
    // first_name: string;

    // @Column({ nullable: true })
    // last_name: string;

    @Column()
    display_name: string;

    @Column({
        default: false,
        select: false
    })
    deactivated: boolean;

    @Column({
        default: false,
        select: false
    })
    staff: boolean;

    @Column({
        default: false,
        select: false
    })
    superuser: boolean;

    @Column({ select: false, nullable: true, unique: true })
    discord_id: string;

    @ManyToMany(() => Community, community => community.members)
    communities: Community[];

    @BeforeInsert()
    async hashPassword(): Promise<void> {
        const hash = crypto.pbkdf2Sync(this.password, process.env.SALT, 10000, 64, 'sha512').toString('hex');
        this.password = hash;
    }

    toResponseObject(): UsersRO {
        const {
            id,
            email,
            password,
            joined,

            display_name,
            discord_id,
            communities
        } = this;

        const responseObject: UsersRO = {
            id,
            email,
            password,
            joined,
            display_name,
            discord_id,
            communities
        };

        return responseObject;
    }
}
