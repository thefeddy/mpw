export class UsersRO {
    id: number;
    email: string;
    password: string;
    joined: Date;
    discord_id: string;
    display_name: string;
    communities: Array<object>;
}

