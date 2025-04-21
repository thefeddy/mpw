import { ApiProperty } from "@nestjs/swagger";
export class CreateUserDTO {
    @ApiProperty()
    readonly email: string;
    @ApiProperty()
    readonly password: string;

}

export class UpdateUserDTO {
    @ApiProperty({ required: false })
    readonly first_name: string;
    @ApiProperty({ required: false })
    readonly last_name: string;
    @ApiProperty({ required: false })
    readonly discord_id: string;
}

export class UserLoginDTO {
    @ApiProperty()
    readonly email: string;
    @ApiProperty()
    readonly password: string;
    @ApiProperty()
    readonly remember: boolean;
}

