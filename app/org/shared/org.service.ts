import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Headers, RequestOptions } from "@angular/http";


@Injectable()
export class OrgService {
    private origamiUrl = "http://origamiapi-staging.azurewebsites.net";
    private getUrl = "/api/Org/GetOrgChart?orgID=1";
    private updateUrl = "/api/Org/EditNode";
    private deleteUrl = "/api/Org/DeleteNode?nodeID=";
    private addUrl = "/api/Org/AddNode";

    constructor(private http: Http) { }

    getNodes() {
        return this.http.get(this.origamiUrl + this.getUrl)
            .map(node => node.json());
    }

    updateNode(orgNode) {
        let node = JSON.stringify(orgNode);
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        let url = this.origamiUrl + this.updateUrl;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    deleteNode(orgNodeID) {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        let url = this.origamiUrl + this.deleteUrl + orgNodeID;
        return this.http.delete(url, options)
            .map(res => res.json());
    }
    addNode(orgNode) {
        let node = JSON.stringify(orgNode);
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        let url = this.origamiUrl + this.addUrl;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    logError(err: any) {
        console.error(err);
    }
}
