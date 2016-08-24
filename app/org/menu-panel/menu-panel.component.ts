import { Component, Input, Output, EventEmitter } from "@angular/core";
import { NgControl  } from "@angular/forms";
import { CanActivate, Router } from "@angular/router-deprecated";

import { OrgCompanyModel, OrgGroupModel, OrgService} from "../shared/index";
import { UserModel } from "../../Shared/index";

declare var $: any;

@Component({
    selector: "sg-menu-panel",
    templateUrl: "app/org/menu-panel/menu-panel.component.html",
    styleUrls: ["app/org/menu-panel/menu-panel.component.css"]
})

export class MenuPanelComponent {
    orgCompanies: OrgCompanyModel[];
    orgCompanyGroups: OrgGroupModel[];

    selectedCompany: OrgCompanyModel;
    selectedGroup: OrgGroupModel;

    userModel: UserModel;

    selectedGroupName: any;
    selectedCompanyName: any;

    @Output() groupSelected = new EventEmitter<OrgGroupModel>();

    constructor(private orgService: OrgService, private router: Router) {
        this.getAllCompanies();
    }

    private getAllCompanies() {
        let profile = localStorage.getItem("profile");
        if (profile) {
            this.userModel = JSON.parse(profile);
            this.orgService.getCompanies(profile)
                .subscribe(data => this.setCompanies(data),
                err => this.orgService.logError(err));
        }
    }

    private setCompanies(data) {
        if (data) {
            this.orgCompanies = data;
            if (this.orgCompanies.length && this.orgCompanies.length > 0) {
                this.orgCompanies.forEach((element) => {
                    if (element.IsDefaultCompany) {
                        this.selectedCompany = element;
                    }
                });

                if (this.selectedCompany) {
                    this.setSelectedGroup(this.selectedCompany.OrgGroups);
                } else {
                    this.selectedCompany = this.orgCompanies[0];
                    this.setSelectedGroup(this.selectedCompany.OrgGroups);
                }
            }
        }
    }

    private setSelectedGroup(groups) {
        if (groups) {
            this.orgCompanyGroups = groups;
            if (this.orgCompanyGroups.length && this.orgCompanyGroups.length > 0) {
                this.orgCompanyGroups.forEach((group) => {
                    if (group.IsDefaultGroup) {
                        this.selectedGroup = group;
                    }
                });

                if (this.selectedGroup) {
                    this.getAllNodes(this.selectedGroup.OrgGroupID);
                } else {
                    this.selectedGroup = this.orgCompanyGroups[0];
                    this.getAllNodes(this.selectedGroup.OrgGroupID);
                }
            }
        }
    }

    private getAllNodes(groupID) {
        let profile = localStorage.getItem("profile");
        if (profile) {
            this.orgService.getOrgNodes(groupID)
                .subscribe(data => this.setOrgGroupData(data),
                err => this.orgService.logError(err),
                () => console.log("Random Quote Complete"));
        }
    }

    private setOrgGroupData(data: any) {
        if (data) {
            this.selectedGroup = data;
            this.selectedGroup.IsSelected = true;
            this.groupSelected.emit(data);
            this.enableDropDowns();
        }
    }

    private enableDropDowns() {
        $(".dropdown-button").dropdown({ constrain_width: false, alignment: "right" });
        $(".organization").dropdown({ constrain_width: false, belowOrigin: true, alignment: "left" });
        $(".group").dropdown({ constrain_width: false, belowOrigin: true, alignment: "left" });
    }

    private logout() {
        localStorage.removeItem("profile");
        localStorage.removeItem("id_token");
        this.router.navigate(["/Login"]);
    }

    private onCompanySelection(data) {
        if (data && data.CompanyID !== this.selectedCompany.CompanyID) {
            this.selectedCompany = data;
            this.selectedCompany.IsSelected = true;
            this.setSelectedGroup(this.selectedCompany.OrgGroups);
        }
    }

    private onGroupSelection(data) {
        if (data && data.OrgGroupID !== this.selectedGroup.OrgGroupID) {
            this.selectedGroup = data;
            this.selectedGroup.IsDefaultGroup = true;
            this.getAllNodes(data.groupID);
        }
    }

    private OnClickOfGroupSetting() {
        this.selectedGroupName = this.selectedGroup.GroupName;
        let modal = document.getElementById("groupSettings");
        modal.style.display = "block";
    }

    private closeGroupSetting() {
        this.selectedGroupName = this.selectedGroup.GroupName;
        let modal = document.getElementById("groupSettings");
        modal.style.display = "none";
    }

    private OnClickOfCompanySetting() {
        this.selectedCompanyName = this.selectedCompany.CompanyName;
        let modal = document.getElementById("companySettings");
        modal.style.display = "block";
    }

    private closeCompanySetting() {
        this.selectedCompanyName = this.selectedCompany.CompanyName;
        let modal = document.getElementById("companySettings");
        modal.style.display = "none";
    }

    private onGroupSave() {
        let group = new OrgGroupModel();
        group.CompanyID = this.selectedGroup.CompanyID;
        group.IsDefaultGroup = this.selectedGroup.IsDefaultGroup;
        group.OrgGroupID = this.selectedGroup.OrgGroupID;
        group.GroupName = this.selectedGroupName;
        group.OrgNodes = null;

        this.orgService.updateGroup(group)
            .subscribe(data => this.setGroupData(data),
            err => this.orgService.logError(err));
    }

    private onCompanySave() {
        let company = new OrgCompanyModel();
        company.CompanyID = this.selectedCompany.CompanyID;
        company.CompanyName = this.selectedCompanyName;
        company.DateCreated = this.selectedCompany.DateCreated;
        company.IsDefaultCompany = this.selectedCompany.IsDefaultCompany;
        company.OrgGroups = null;
        this.updateCompany(company);
    }

    updateCompany(data) {
        if (data) {
            this.orgService.updateCompany(data)
                .subscribe(data => this.setCompanyData(data),
                err => this.orgService.logError(err));
        }
    }

    setCompanyData(data) {
        if (data) {
            this.selectedCompany = data;
            this.orgCompanies.forEach(company => {
                this.updateOrgCompany(company, data);
            });
        }
    }

    setGroupData(data) {
        if (data) {
            this.selectedGroup = data;
            this.orgCompanyGroups.forEach(group => {
                this.updateOrgGroup(group, data);
            });
        }
    }

    updateOrgCompany(company: OrgCompanyModel, updatedCompany) {
        if (this.compareCompanyID(company, updatedCompany)) {
            company.CompanyID = updatedCompany.CompanyID;
            company.CompanyName = updatedCompany.CompanyName;
            company.DateCreated = updatedCompany.DateCreated;
            company.IsDefaultCompany = updatedCompany.IsDefaultCompany;
            company.IsSelected = true;
            return true;
        }
    }

    updateOrgGroup(group: OrgGroupModel, updatedGroup) {
        if (this.compareGroupID(group, updatedGroup)) {
            group.CompanyID = updatedGroup.CompanyID;
            group.GroupName = updatedGroup.GroupName;
            group.IsDefaultGroup = updatedGroup.IsDefaultGroup;
            group.OrgGroupID = updatedGroup.OrgGroupID;
            group.IsSelected = true;
            return true;
        }
    }

    private compareCompanyID(updatedNode: OrgCompanyModel, currentNode: OrgCompanyModel): boolean {
        if (updatedNode != null && currentNode != null) {
            return updatedNode.CompanyID === currentNode.CompanyID;
        } else {
            return false;
        }
    }

    private compareGroupID(updatedNode: OrgGroupModel, currentNode: OrgGroupModel): boolean {
        if (updatedNode != null && currentNode != null) {
            return updatedNode.OrgGroupID === currentNode.OrgGroupID;
        } else {
            return false;
        }
    }


    private onGroupSettingsChange(event: KeyboardEvent, ngControl: NgControl) {
        if (ngControl.name === "groupName") {
            this.selectedGroupName = ngControl.value;
        }
    }

    private onCompanySettingsChange(event: KeyboardEvent, ngControl: NgControl) {
        if (ngControl.name === "companyName") {
            this.selectedCompanyName = ngControl.value;
        }
    }
}