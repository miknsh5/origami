import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class OrgService {
    private origamiUrl = 'http://origamiapi-staging.azurewebsites.net';
    private getUrl = '/api/Org/GetOrgChart?orgID=1';
    private updateUrl = '/api/Org/EditNode';
    private deleteUrl = '/api/Org/DeleteNode?nodeID=';

    constructor(private http: Http) { }

    getNodes() {
        return this.http.get(this.origamiUrl + this.getUrl)
            .map(node => node.json());
    }

    updateNodes(orgNode) {
        let node = JSON.stringify(orgNode);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.origamiUrl + this.updateUrl, node, options)
            .map(res => res.json());
    }

    deleteNode(orgNodeID) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.delete(this.origamiUrl + this.deleteUrl + orgNodeID, options)
            .map(res => res.json());
    }

    logError(err: any) {
        console.error(err);
    }
}
