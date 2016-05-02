import {Injectable} from 'angular2/core';
import {PEOPLE} from './mock-people';
import {Http, Response} from 'angular2/http';
import {Observable}     from 'rxjs/Observable';

@Injectable()

export class PeopleService {
    constructor(private http:Http){}
     private _origamiUrl = 'origamiapi.azurewebsites.net/api/Org/GetOrgChart?orgID=2';
     randomQuote:any;
    getPeople() {
      this.http.get('http://origamiapi.azurewebsites.net/api/Org/GetOrgChart?orgID=2')
    .map(res => res.text())
    .subscribe(
      data => this.randomQuote = data,
      err => this.handleError(err),
      () => console.log('Random Quote Complete')
    );
        alert(this.randomQuote);
        return Promise.resolve(PEOPLE);
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