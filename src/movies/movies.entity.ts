import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    Unique,
    Index,
    ManyToMany
} from 'typeorm';

import { MoviesRO } from './movies.ro';
import { Community } from 'src/community/community.entity';

@Entity()
export class Movies {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'movie_id',
        type: 'varchar',
        nullable: true,
        length: 255
    })
    movie_id: string;


    @Column({
        name: 'rating',
        nullable: true,
    })
    rating: number;

    @Column({
        name: 'watched_on',
        type: 'timestamptz',
        nullable: true,
    })
    watched_on: Date;

    @Column({
        name: 'added',
        type: 'timestamptz',
        default: new Date()
    })
    added: Date;

    @ManyToMany(() => Community, community => community.id)
    communities: Community[];

    @Column({
        name: 'background',
        type: 'varchar',
        nullable: true,
        length: 255
    })
    background: string;


    toResponseObject(): MoviesRO {
        const { id, movie_id, watched_on, added, rating, background } = this;

        const responseObject: MoviesRO = {
            id,
            movie_id,
            watched_on,
            added,
            rating,
            background
        };

        return responseObject;
    }
}
