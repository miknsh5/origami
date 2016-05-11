import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import {OrgChart} from './Models/orgChart';
@Injectable()

export class PeopleService {
    constructor(private http:Http){}
     private _origamiUrl = 'http://origamiapi.azurewebsites.net/api/Org/GetOrgChart?orgID=2';
     organizationChart:OrgChart;
   
    getPeople() {
    return   this.http.get(this._origamiUrl)
    .map(res => res.json())
    }
  
      private extractData(res: Response) {
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }
    let body = res.json();
    alert(body.data);
    return body.data || { };
  }
  
}