import { Component } from "@angular/core";

import { AuthService, OrgService, UserDetails, UserModel, DOMHelper } from "../../shared/index";

@Component({
    selector: "pt-admin",
    templateUrl: "app/container/admin/admin.component.html",
    styleUrls: ["app/container/admin/admin.component.css"]
})

export class AdminComponent {
    private userDetails: Array<UserDetails>;
    private userModel: UserModel;
    private userCount: number = 0;
    private organizationCount: number = 0;
    private orgNodeCount: number = 0;

    constructor(private orgService: OrgService, private auth: AuthService, private domHelper: DOMHelper) {
        let profile = localStorage.getItem("profile");
        if (profile) {
            this.userModel = JSON.parse(profile);
            this.getAllUsers(this.userModel.UserID);
        }
    }

    getAllUsers(userID) {
        this.orgService.getAllUsersAndCompanies(userID)
            .subscribe(data => this.displayDetails(data),
            err => {
                this.orgService.logError(err);
            });
    }

    displayDetails(data: Array<UserDetails>) {
        if (data) {
            this.userDetails = data;
            this.userCount = this.userDetails.length;
            this.userDetails.forEach((d) => {
                d.Company.forEach(d => {
                    this.organizationCount += d.OrgGroups.length;
                    d.OrgGroups.forEach(d => {
                        this.orgNodeCount += d.OrgNodeCounts;
                    });
                });
            });
            this.domHelper.initCollapsible();
            this.domHelper.initDropDown(".dropdown-button", { constrain_width: false, alignment: "right" });
        }
    }
}