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
    ManyToMany,
    JoinTable,
    ManyToOne,
} from 'typeorm';


import { randomBytes } from 'crypto';

import { CommunityRO } from './community.ro';

import { Users } from 'src/users/users.entity';
import { Media } from 'src/media/media.entity';


@Entity()
export class Community {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Users, user => user.id, { cascade: true })
    @JoinColumn({ name: 'owner' })
    owner: Users;

    @Column({
        nullable: true,
        select: false
    })
    join_password: string;

    @Column()
    open: boolean;

    @Column({ default: false })
    private: boolean;

    @Column({ nullable: true })
    discord_webhook: string;

    @Column({ nullable: true })
    discord: string;

    @Column({ nullable: true })
    photo: string;

    @Column({ nullable: true })
    banner: string;

    @ManyToMany(() => Media, movies => movies.communities, { cascade: true })
    @JoinTable({
        name: 'community_media',
    })
    media: Array<Object>;

    @ManyToMany(() => Users, users => users.communities, { cascade: true })
    @JoinTable({
        name: 'communities',
    })
    members: Array<object>;

    @Column({ default: new Date() })
    created: Date;

    @BeforeInsert()
    setJoinPassword(): void {
        if (this.private === true) {
            this.join_password = randomBytes(4).toString('hex').toUpperCase();
        }
    }


    toResponseObject(): CommunityRO {
        const { id, owner, join_password, open } = this;

        const responseObject: CommunityRO = {
            id,
            owner,
            join_password,
            open
        };

        return responseObject;
    }
}
