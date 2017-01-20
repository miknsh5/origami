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

    constructor(private orgService: OrgService, private auth: AuthService, private domHelper: DOMHelper) {
        let profile = localStorage.getItem("profile");
        if (profile) {
            this.userModel = JSON.parse(profile);
            if (this.userModel.UserID === "579f2a8585be5a762320c1bf") {
                this.getDetails();
            } else {
                setTimeout(() => {
                    this.domHelper.initDropDown(".dropdown-button", { constrain_width: false, alignment: "right" });
                }, 500);
            }
        }
    }

    getDetails() {
        this.orgService.getDetailsForAdmin()
            .subscribe(data => this.displayDetails(data),
            err => this.orgService.logError(err));
    }

    displayDetails(data: Array<UserDetails>) {
        if (data) {
            this.userDetails = data;
            this.domHelper.initCollapsible();
            this.domHelper.initDropDown(".dropdown-button", { constrain_width: false, alignment: "right" });
        }
    }
}