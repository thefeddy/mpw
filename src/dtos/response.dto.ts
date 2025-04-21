import { HttpStatus } from "@nestjs/common";

export class ResponseDTO {
    status: HttpStatus;
    message: string;
    errors: [];
    data: object;
}