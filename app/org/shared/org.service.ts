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
    private addGroupUrl = "api/Org/AddOrgGroup?userID=";
    private addCompanyUrl = "api/Org/AddCompanyForUser?userID=";
    private setDefaultGroupUrl = "api/Org/SetDefaultGroupForCompanyUser?userID=";
    private setDefaultCompanyUrl = "api/Org/SetDefaultCompanyForUser?userID=";
    private addGroupNodesUrl = "api/Org/AddGroupNodes?groupID=";
    private deleteGroupUrl = "api/Org/DeleteCompanyGroup?groupID=";
    private deleteComapnyUrl = "api/Org/DeleteCompany?companyID=";
    private headers: Headers;

    constructor(private http: Http) {
        this.headers = new Headers({ "Content-Type": "application/json" });
        this.headers.append("Accept", "application/json");
    }

    getCompanies(userProfile) {
        let url = this.origamiUrl + this.getCompaniesUrl;

        return this.http.post(url, userProfile, { headers: this.headers })
            .map(node => node.json());
    }

    getOrgNodes(groupID) {
        let url = this.origamiUrl + this.getUrl + groupID;

        return this.http.get(url, { headers: this.headers })
            .map(node => node.json());
    }

    updateGroup(orgGroup) {
        let group = JSON.stringify(orgGroup);
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.updateGroupUrl;
        return this.http.post(url, group, options)
            .map(res => res.json());
    }

    updateCompany(orgCompany) {
        let company = JSON.stringify(orgCompany);
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.updateCompanyUrl;
        return this.http.post(url, company, options)
            .map(res => res.json());
    }

    updateNode(orgNode) {
        let node = JSON.stringify(orgNode);
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.updateUrl;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    deleteNode(orgNodeID) {
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.deleteUrl + orgNodeID;
        return this.http.delete(url, options)
            .map(res => res.json());
    }

    addNode(orgNode) {
        let node = JSON.stringify(orgNode);
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.addUrl;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    addRootNode(orgNode) {
        let node = JSON.stringify(orgNode);
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.addRootNodeUrl;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    addGroup(group, userID) {
        group = JSON.stringify(group);
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.addGroupUrl + userID;
        return this.http.post(url, group, options)
            .map(res => res.json());
    }

    addCompany(company, userID) {
        company = JSON.stringify(company);
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.addCompanyUrl + userID;
        return this.http.post(url, company, options)
            .map(res => res.json());
    }

    setDefaultGroup(userID, companyID, groupID) {
        let companyData = "&companyID=" + companyID;
        let groupData = "&groupID=" + groupID;
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.setDefaultGroupUrl + userID + companyData + groupData;
        return this.http.post(url, null, options)
            .map(res => res.json());
    }

    setDefaultCompany(userID, companyID) {
        let companyData = "&companyID=" + companyID;
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.setDefaultCompanyUrl + userID + companyData;
        return this.http.post(url, null, options)
            .map(res => res.json());
    }

    addGroupNodes(groupID, orgNodes, defaultParentID) {
        let orgNodeList = JSON.stringify(orgNodes);
        let addGroupNodesurl = "&defaultParentID=";
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.addGroupNodesUrl + groupID + addGroupNodesurl + defaultParentID;
        return this.http.post(url, orgNodeList, options)
            .map(res => res.json());
    }

    deleteGroup(groupID) {
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.deleteGroupUrl + groupID;
        return this.http.delete(url, options)
            .map(res => res.json());
    }

    deleteCompany(companyID) {
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + this.deleteComapnyUrl + companyID;
        return this.http.delete(url, options)
            .map(res => res.json());
    }

    sendFeedback(userFeedback) {
        let feedbackUrl = "api/email/SendFeedback";
        let url = this.origamiUrl + feedbackUrl;
        return this.http.post(url, userFeedback, { headers: this.headers })
            .map(node => node.json());
    }

    changeParent(childNode) {
        let changeParentLink = `api/Org/ChangeParent`;
        let node = JSON.stringify(childNode);
        let options = new RequestOptions({ headers: this.headers });
        let url = this.origamiUrl + changeParentLink;
        return this.http.post(url, node, options)
            .map(res => res.json());
    }

    logError(err: any) {
        console.error(err);
    }
}
