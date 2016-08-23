import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Headers, RequestOptions } from "@angular/http";


@Injectable()
export class OrgService {
    private origamiUrl = "//origamistageapi.azurewebsites.net/";
    private getCompaniesUrl = "api/Org/GetCompaniesForUser";
    private getUrl = "api/Org/GetNodesForGroup?orgGroupID=";
    private updateGroupUrl = "api/Org/UpdateGroup";
    private updateCompanyUrl = "api/Org/UpdateCompany";
    private updateUrl = "api/Org/EditNode";
    private deleteUrl = "api/Org/DeleteNode?nodeID=";
    private addUrl = "api/Org/AddNode";
    private addRootNodeUrl = "api/Org/AddRootNode";
    private getOrgChartUrl = "api/Org/GetNodesForGroup?orgGroupID=";
    constructor(private http: Http) { }

    getCompanies(userProfile) {
        let url = this.origamiUrl + this.getCompaniesUrl;
        let headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Accept", "application/json");

        return this.http.post(url, userProfile, { headers: headers })
            .map(node => node.json());
    }

    getOrgNodes(groupID) {
        let url = this.origamiUrl + this.getUrl + groupID;
        let headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Accept", "application/json");

        return this.http.get(url, { headers: headers })
            .map(node => node.json());
    }

    updateGroup(orgGroup) {
        let group = JSON.stringify(orgGroup);
        let headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Accept", "application/json");
        let options = new RequestOptions({ headers: headers });
        let url = this.origamiUrl + this.updateGroupUrl;
        return this.http.post(url, group, options)
            .map(res => res.json());
    }

    updateCompany(orgCompany) {
        let company = JSON.stringify(orgCompany);
        let headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Accept", "application/json");
        let options = new RequestOptions({ headers: headers });
        let url = this.origamiUrl + this.updateCompanyUrl;
        return this.http.post(url, company, options)
            .map(res => res.json());
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
