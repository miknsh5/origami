import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class OrgService {
    private origamiUrl = 'http://origamiapi.azurewebsites.net/api/Org/GetOrgChart?orgID=2';

    constructor(private http: Http) { }

    getNodes() {
        return this.http.get(this.origamiUrl)
            .map(node => node.json());
    }

    logError(err: any) {
        console.error(err);
    }
}
