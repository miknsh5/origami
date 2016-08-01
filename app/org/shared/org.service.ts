import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Headers, RequestOptions } from "@angular/http";


@Injectable()
export class OrgService {
    private origamiUrl = "//origamiapi.azurewebsites.net/";
    private getUrl = "api/Org/GetOrgChart";
    private updateUrl = "api/Org/EditNode";
    private deleteUrl = "api/Org/DeleteNode?nodeID=";
    private addUrl = "api/Org/AddNode";
    private addRootNodeUrl = "api/Org/AddRootNode";
    private getOrgChartUrl = "api/Org/GetChartForOrg?orgID=";
    constructor(private http: Http) { }

    getNodes(userProfile) {
        let url = this.origamiUrl + this.getUrl;
        let headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Accept", "application/json");

        return this.http.post(url, userProfile, { headers: headers })
            .map(node => node.json());
    }

    getOrgNodes(orgID) {
        let url = this.origamiUrl + this.getOrgChartUrl + orgID;
        let headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Accept", "application/json");

        return this.http.get(url, { headers: headers })
            .map(node => node.json());
    }

    updateNode(orgNode) {
        let node = JSON.stringify(orgNode);
        let headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Accept", "application/json");
        let options = new RequestOptions({ headers: headers });
        let url = this.origamiUrl + this.updateUrl;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    deleteNode(orgNodeID) {
        let headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Accept", "application/json");
        let options = new RequestOptions({ headers: headers });
        let url = this.origamiUrl + this.deleteUrl + orgNodeID;
        return this.http.delete(url, options)
            .map(res => res.json());
    }

    addNode(orgNode) {
        let node = JSON.stringify(orgNode);
        let headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Accept", "application/json");
        let options = new RequestOptions({ headers: headers });
        let url = this.origamiUrl + this.addUrl;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    addRootNode(orgNode) {
        let node = JSON.stringify(orgNode);
        let headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Accept", "application/json");
        let options = new RequestOptions({ headers: headers });
        let url = this.origamiUrl + this.addRootNodeUrl;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    logError(err: any) {
        console.error(err);
    }
}
