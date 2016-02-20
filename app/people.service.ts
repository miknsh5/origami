import {Hero} from './person';
import {Injectable} from 'angular2/core';
import {POPLE} from './mock-people';

@Injectable()

export class PeopleService {
    getPeople() {
        return Promise.resolve(PEOPLE);
    }
}