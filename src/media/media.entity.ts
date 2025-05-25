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

import { MedaiRO } from './media.ro';
import { Community } from 'src/community/community.entity';

@Entity()
export class Media {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'media_id',
        type: 'varchar',
        nullable: true,
        length: 255
    })
    media_id: string;


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

    @Column({
        name: 'type',
        type: 'varchar',
        nullable: false,
        length: 255
    })
    type: string;


    toResponseObject(): MedaiRO {
        const { id, media_id, watched_on, added, rating, background, type } = this;

        const responseObject: MedaiRO = {
            id,
            media_id,
            watched_on,
            added,
            rating,
            background,
            type
        };

        return responseObject;
    }
}
