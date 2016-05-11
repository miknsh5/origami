// Core
import { Component, Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import { provide } from '@angular/core';
import { HTTP_PROVIDERS, Http } from '@angular/http';
import { AuthHttp, tokenNotExpired, JwtHelper } from 'angular2-jwt';
import { OrgChart } from './Models/OrgChart';
import { OrgNode } from './Models/OrgNode';

// Interfaces
import { Observable } from 'rxjs/Observable';

// Components
import { PersonDetailComponent } from './person-detail.component';
import { SearchbarComponent } from './searchbar.component';
import { NavComponent } from './nav.component';

// Services
import { PeopleService } from './people.service';

declare var Auth0Lock;

@Component({
    selector: 'app',
    directives: [PersonDetailComponent, SearchbarComponent, NavComponent],
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
                <li *ngFor="let node of orgNodes">
                    <span (click)="selectNode(node)"  class="badge person">{{node.NodeFirstName}}</span> <span class="badge title">{{node.Description}}</span>
                    <ul *ngIf="node.children">
                        <li *ngFor="let childNode of node.children">
                            <span (click)="selectNode(childNode)"  class="badge person">{{childNode.NodeFirstName}}</span> <span class="badge title">{{childNode.Description}}</span>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <my-person-detail #personDetail [selectedNode]="selectedNode" (deleteNode)="onNodeDeleted($event)"></my-person-detail>
        <searchbar></searchbar>
    `,
    styles: [`
        .person {
            cursor: pointer;
            color: #222222;
        }
         .title {
            cursor: pointer;
            color: #222222;
             font-style: italic;
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
    providers: [HTTP_PROVIDERS, PeopleService]
})


export class AppComponent implements OnInit {
    organizationChart: OrgChart;
    errorMessage: string;
    orgNodes: OrgNode[];
    @Output() selectedNode = new EventEmitter<OrgNode>();

    lock = new Auth0Lock('bRQg0MUBHOozAIXyHONfZRWsT7JeIqT5', 'axd-origami.auth0.com');

    selectNode(node) {

        this.selectedNode = node;
        console.log("Selected! " + node.NodeFirstName);
    }

    loadChart() {
        this.getOrgChartAndNodes();
    }

    constructor(private _peopleService: PeopleService) { }

    getOrgChartAndNodes() {
        this._peopleService.getPeople().subscribe(
            data => this.setData(data),
            err => this.handleError(err),
            () => console.log('Random Quote Complete'));
    }

    private setData(data: any) {
        this.organizationChart = data;        
        this.orgNodes = this.organizationChart.OrgNodes;
        console.log(this.organizationChart);
    }

    private handleError(error: any) {
        // In a real world app, we might send the error to remote logging infrastructure
        let errMsg = error.message || 'Server error';
        alert(errMsg);
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }

    onNodeDeleted(deleted) {
        let index = this.orgNodes.indexOf(deleted, 0);
        if (index > -1) {
            this.orgNodes.splice(index, 1);
            this.selectedNode = null;
        }
        else {
            this.orgNodes.forEach(element => {
                let index = element.children.indexOf(deleted, 0);
                if (index > -1) {
                    element.children.splice(index, 1);
                    this.selectedNode = null;
                }
            });
        }
    }

    ngOnInit() {
        this.getOrgChartAndNodes();
        //check if token exists in local storage for logged in user.
        //this.getUserProfile();
    }

    login() {
        this.lock.show(function (err, profile, id_token) {
            if (err) {
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
