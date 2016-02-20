import {Component} from 'angular2/core';
import {OnInit} from 'angular2/core';
import {Person} from './person';
import {PersonDetailComponent} from './person-detail.component';
import {PeopleService} from './people.service';
import {SearchbarComponent} from './searchbar.component';
import {NavComponent} from './nav.component';


@Component({
    selector: 'app',
    directives: [PersonDetailComponent, SearchbarComponent, NavComponent],
    template: `
    <nav></nav>
    <h1>Welcome to Origami</h1>
    <ul>
      <li *ngFor="#person of people">
        <span class="badge">{{person.name}}</span> {{person.manager}}
      </li>
    </ul>
    <my-person-detail>MyPerson</my-person-detail>
    <searchbar></searchbar>
  `,
    styles: [`

    `],
    providers: [PeopleService]
})


export class AppComponent implements OnInit {
    people: Person[];

    constructor(private _peopleService: PeopleService) { }

    getPeople(){
        this._peopleService.getPeople().then(people => this.people = people);
    }

    ngOnInit(){
       this.getPeople();
    }

    //lock = new Auth0Lock('bRQg0MUBHOozAIXyHONfZRWsT7JeIqT5', 'axd-origami.auth0.com');


}
