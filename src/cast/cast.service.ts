import { Injectable, HttpException, HttpStatus, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { map, catchError } from 'rxjs/operators';

import { CreateMovieDTO, MoviesDTO } from './cast.dto';

import { Community } from 'src/community/community.entity';
import { CommunityService } from 'src/community/community.service';

/* Constants */
import * as MessagesConstants from '../constants/messages.constants';


@Injectable()
export class CastService {
    constructor() { }
}
