import { ApiProperty } from "@nestjs/swagger";

export class MoviesDTO {
    @ApiProperty()
    readonly id: number;
    @ApiProperty()
    readonly movie_id: string;
    @ApiProperty()
    readonly watched: number;
}

export class CreateMovieDTO {
    @ApiProperty()
    readonly community_id: number;
    @ApiProperty()
    readonly movie_id: string;
}

export class WatchedMovieDTO {
    @ApiProperty()
    readonly id: number;
    @ApiProperty()
    readonly movie_id: string;
    @ApiProperty()
    readonly watched: number;
}
