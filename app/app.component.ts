// Core
import {Component, Output, EventEmitter} from 'angular2/core';
import {OnInit} from 'angular2/core';
import {provide} from 'angular2/core';
import {RouteConfig, Router, APP_BASE_HREF, ROUTER_PROVIDERS, ROUTER_DIRECTIVES, CanActivate} from 'angular2/router';
import {HTTP_PROVIDERS, Http} from 'angular2/http';
import {AuthHttp, tokenNotExpired, JwtHelper} from 'angular2-jwt';

// Interfaces
import {Person} from './person';
//import {UserProfile} from './user-profile';

// Components
import {PersonDetailComponent} from './person-detail.component';
import {SearchbarComponent} from './searchbar.component';
import {NavComponent} from './nav.component';

// Services
import {PeopleService} from './people.service';

declare var Auth0Lock;

@Component({
    selector: 'app',
    directives: [PersonDetailComponent, SearchbarComponent, NavComponent, ROUTER_DIRECTIVES],
    template: `
    <nav></nav>
    <div class="auth-panel">
        <h2>Authentication</h2>
        <button *ngIf="!loggedIn()" (click)="login()">Login</button>
        <div *ngIf="loggedIn()">
            <!--<h4>Welcome {{userProfile.name}}</h4>-->
            <button (click)="logout()">Logout</button>
        </div>
    </div>
    <div class="main-canvas">
        <h1>Welcome to Origami</h1>
        <ul *ngIf="loggedIn()">
          <li *ngFor="#person of people">
            <span (click)="selectPerson(person)" class="badge person">{{person.name}}</span> {{person.manager}}
          </li>
        </ul>
    </div>
    <my-person-detail [selectedPerson]="newPerson"></my-person-detail>
    <searchbar></searchbar>
  `,
    styles: [`
        .person {
            cursor: pointer;
            color: #222222;
        }
        .auth-panel {
            position:absolute;
            top:20px;
            right: 20px;
        }
       .person:hover {
            color: #029BFF;
        }
        .main-canvas {
            padding: 50px;
            position: absolute;
            left: 200px;
            top: 0;
        }
    `],
    providers: [PeopleService]
})


export class AppComponent implements OnInit {
    people: Person[];

    @Output() newPerson = new EventEmitter<Person>();

    lock = new Auth0Lock('bRQg0MUBHOozAIXyHONfZRWsT7JeIqT5', 'axd-origami.auth0.com');

    selectPerson(person){
        this.newPerson = person;
        console.log("Selected! " + person.name);
    }

    constructor(private _peopleService: PeopleService) { }

    getPeople(){
        this._peopleService.getPeople().then(people => this.people = people);
    }

    ngOnInit(){
        this.getPeople();

        //check if token exists in local storage for logged in user.
        //this.getUserProfile();
    }

    login() {
        this.lock.show(function(err, profile, id_token) {

            if(err) {
                throw new Error(err);
            }

            localStorage.setItem('profile', JSON.stringify(profile));
            localStorage.setItem('id_token', id_token);
        });

    }

    logout() {
        localStorage.removeItem('profile');
        localStorage.removeItem('id_token');
    }

    loggedIn() {
        return tokenNotExpired();
    }

}
