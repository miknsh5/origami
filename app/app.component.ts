// Core
import {Component, Output, EventEmitter} from 'angular2/core';
import {OnInit} from 'angular2/core';
import {provide} from 'angular2/core';
import {RouteConfig, Router, APP_BASE_HREF, ROUTER_PROVIDERS, ROUTER_DIRECTIVES, CanActivate} from 'angular2/router';
import {HTTP_PROVIDERS, Http} from 'angular2/http';
import {AuthHttp, tokenNotExpired, JwtHelper} from 'angular2-jwt';
import {OrgChart} from './Models/OrgChart';
import {OrgNode} from './Models/OrgNode';
// Interfaces
import {Person} from './person';
//import {UserProfile} from './user-profile';
import {Observable}     from 'rxjs/Observable';
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
        <button (click)="loadChart()">Load</button>
        <button *ngIf="!loggedIn()" (click)="login()">Login</button>
        <div *ngIf="loggedIn()">
            <!--<h4>Welcome {{userProfile.name}}</h4>-->
            <button (click)="logout()">Logout</button>
        </div>
    </div>
    <div class="main-canvas" *ngIf="organizationChart">
        <h1>Welcome to {{organizationChart.OrganizationName}}</h1>
        <ul *ngIf="loggedIn()">
          <li *ngFor="#node of orgNodes">
            <span class="badge person">{{node.NodeFirstName}}</span> {{node.Description}}
              <ul *ngIf="node.ChildNodes">
          <li *ngFor="#childNode of node.ChildNodes">
            <span class="badge person">{{childNode.NodeFirstName}}</span> {{childNode.Description}}
            
          </li>
        </ul>
          </li>
        </ul>
    </div>
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
    providers: [HTTP_PROVIDERS,PeopleService]
})


export class AppComponent implements OnInit {
    organizationChart:OrgChart;
    errorMessage:string;
    orgNodes:OrgNode[];    
    @Output() newPerson = new EventEmitter<Person>();

    lock = new Auth0Lock('bRQg0MUBHOozAIXyHONfZRWsT7JeIqT5', 'axd-origami.auth0.com');

    selectPerson(person){
        this.newPerson = person;
        console.log("Selected! " + person.name);
    }
loadChart()
{
   this.getOrgChartAndNodes() ;
}
    constructor(private _peopleService: PeopleService) { }

    getOrgChartAndNodes(){
        this._peopleService.getPeople().subscribe(
      data => this.setData(data) ,
      err => this.handleError(err),
      () => console.log('Random Quote Complete'));
     
      // alert(this.organizationChart);
     
       
    }
    private setData(data:any)
    {
        this.organizationChart= data;
        this.orgNodes= this.organizationChart.OrgNodes;
    }
    private handleError (error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    let errMsg = error.message || 'Server error';
    alert(errMsg);
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
  /*  onNodeDeleted(deleted)
    {
        
     
        let index =this. people.indexOf(deleted, 0);
        if (index > -1) {
         this.people.splice(index, 1);
         this.newPerson=null;
    }
       
    }*/

    ngOnInit(){
        
 // this.getOrgChartAndNodes();
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
