import { Users } from 'src/users/users.entity';

export class CommunityRO {
    id: number;
    owner: Users;
    join_password: string;
    open: boolean;
}

