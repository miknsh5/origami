import {Injectable} from 'angular2/core';
import {PEOPLE} from './mock-people';
import {Http, Response} from 'angular2/http';
import {Observable}     from 'rxjs/Observable';
import {OrgChart} from './Models/orgChart';
@Injectable()

export class PeopleService {
    constructor(private http:Http){}
     private _origamiUrl = 'http://origamiapi.azurewebsites.net/api/Org/GetOrgChart?orgID=2';
     organizationChart:OrgChart;
    getPeople() {
      this.http.get(this._origamiUrl)
    .map(res => res.json())
    .subscribe(
      data => this.organizationChart = data,
      err => this.handleError(err),
      () => console.log('Random Quote Complete')
    );
      return this.organizationChart;
    }
      private extractData(res: Response) {
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }
    let body = res.json();
    alert(body.data);
    return body.data || { };
  }
  private handleError (error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    let errMsg = error.message || 'Server error';
    alert(errMsg);
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}