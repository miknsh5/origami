import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Headers, RequestOptions } from "@angular/http";

@Injectable()
export class OrgService {
    readonly apiUrl = "//origamiapi.azurewebsites.net/"; // "//peopletreeapi.azurewebsites.net/";
    private headers: Headers;

    constructor(private http: Http) {
        this.headers = new Headers({ "Content-Type": "application/json" });
        this.headers.append("Accept", "application/json");
    }

    getCompanies(userProfile) {
        let url = `${this.apiUrl}api/Org/GetCompaniesForUser`;

        return this.http.post(url, userProfile, { headers: this.headers })
            .map(node => node.json());
    }

    getOrgNodes(groupID) {
        let url = `${this.apiUrl}api/Org/GetNodesForGroup?orgGroupID=${groupID}`;

        return this.http.get(url, { headers: this.headers })
            .map(node => node.json());
    }

    updateGroup(orgGroup) {
        let group = JSON.stringify(orgGroup);
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/UpdateGroup`;
        return this.http.post(url, group, options)
            .map(res => res.json());
    }

    updateCompany(orgCompany) {
        let company = JSON.stringify(orgCompany);
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/UpdateCompany`;
        return this.http.post(url, company, options)
            .map(res => res.json());
    }

    updateNode(orgNode) {
        let node = JSON.stringify(orgNode);
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/EditNode`;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    deleteNode(orgNodeID, childNodeID?) {
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/DeleteNode?nodeID=${orgNodeID}&childNodeID=${childNodeID}`;
        return this.http.delete(url, options)
            .map(res => res.json());
    }

    addNode(orgNode) {
        let node = JSON.stringify(orgNode);
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/AddNode`;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    addRootNode(orgNode) {
        let node = JSON.stringify(orgNode);
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/AddRootNode`;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    addGroup(group, userID) {
        group = JSON.stringify(group);
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/AddOrgGroup?userID=${userID}`;
        return this.http.post(url, group, options)
            .map(res => res.json());
    }

    addCompany(company, userID) {
        company = JSON.stringify(company);
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/AddCompanyForUser?userID=${userID}`;
        return this.http.post(url, company, options)
            .map(res => res.json());
    }

    setDefaultGroup(userID, companyID, groupID) {
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/SetDefaultGroupForCompanyUser?userID=${userID}&companyID=${companyID}&groupID=${groupID}`;
        return this.http.post(url, null, options)
            .map(res => res.json());
    }

    setDefaultCompany(userID, companyID) {
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/SetDefaultCompanyForUser?userID=${userID}&companyID=${companyID}`;
        return this.http.post(url, null, options)
            .map(res => res.json());
    }

    addGroupNodes(groupID, orgNodes, defaultParentID) {
        let orgNodeList = JSON.stringify(orgNodes);
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/AddGroupNodes?groupID=${groupID}&defaultParentID=${defaultParentID}`;
        return this.http.post(url, orgNodeList, options)
            .map(res => res.json());
    }

    deleteGroup(groupID) {
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/DeleteCompanyGroup?groupID=${groupID}`;
        return this.http.delete(url, options)
            .map(res => res.json());
    }

    deleteCompany(companyID) {
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/DeleteCompany?companyID=${companyID}`;
        return this.http.delete(url, options)
            .map(res => res.json());
    }

    sendFeedback(userFeedback) {
        let url = `${this.apiUrl}api/email/SendFeedback`;
        return this.http.post(url, userFeedback, { headers: this.headers })
            .map(node => node.json());
    }

    changeParent(childNode) {
        let node = JSON.stringify(childNode);
        let options = new RequestOptions({ headers: this.headers });
        let url = `${this.apiUrl}api/Org/ChangeParent`;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    logError(err: any) {
        console.error(err);
    }
}
