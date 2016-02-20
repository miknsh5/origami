import {Injectable} from 'angular2/core';
import {PEOPLE} from './mock-people';

@Injectable()

export class PeopleService {
    getPeople() {
        return Promise.resolve(PEOPLE);
    }
}