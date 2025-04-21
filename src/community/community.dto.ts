import { ApiProperty } from "@nestjs/swagger";
import { Users } from "src/users/users.entity";

export class CommunityDTO {
    readonly id: number;
    readonly owner: Users;
    readonly join_password: string;
    readonly open: boolean;
    readonly members: Array<Users>;
}


export class CreateCommunityDTO {
    @ApiProperty()
    readonly owner: number;

    @ApiProperty()
    readonly open: boolean;

    @ApiProperty()
    readonly name: string;

    @ApiProperty()
    readonly private: boolean;
}

export class JoinCommunityDTO {
    @ApiProperty()
    readonly user: number;

    @ApiProperty()
    readonly community: number;

    @ApiProperty()
    readonly join_password: string;
}