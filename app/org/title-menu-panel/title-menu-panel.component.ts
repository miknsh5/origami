import { Component, Input, Output, OnChanges, SimpleChange, EventEmitter, OnDestroy} from "@angular/core";
import { NgControl  } from "@angular/forms";
import { CanActivate, Router } from "@angular/router-deprecated";

import { OrgCompanyModel, OrgGroupModel, OrgService} from "../shared/index";
import { UserModel } from "../../Shared/models/user.model";
@Component({
    selector: "sg-origami-title-menu-panel",
    templateUrl: "app/org/title-menu-panel/title-menu-panel.component.html",
    styleUrls: ["app/org/title-menu-panel/title-menu-panel.component.css"]
})

export class TitleMenuPanelComponent implements OnChanges {

    selectedCompany: OrgCompanyModel;
    selectedGroup: OrgGroupModel;
    userGroups: OrgGroupModel[];
    userCompany: OrgCompanyModel[];

    selectedGroupName: any;
    selectedCompanyName: any;

    // groupCount: number;
    // nodeCount: number;

    @Input() userCompanies: OrgCompanyModel;
    @Input() userModel: UserModel;

    // @Output() updateOrgGroups = new EventEmitter<OrgGroupModel []>() ;
    // @Output() updateOrgCompanies = new EventEmitter<OrgCompanyModel []>();

    constructor(private orgService: OrgService, private router: Router) {
    }


    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["userCompanies"]) {
            this.getDefaultCompany(this.userCompanies);
        }
    }


    logout() {
        localStorage.removeItem("profile");
        localStorage.removeItem("id_token");
        this.router.navigate(["/Login"]);
    }

    getDefaultCompany(usercompanies) {
        if (usercompanies) {
            let companies: OrgCompanyModel[] = usercompanies;
            if (companies.length && companies.length <= 1) {
                this.selectedCompany = companies[0];
                this.selectedCompanyName = this.selectedCompany.CompanyName;
                this.selectedCompany.IsSelected = true;
                this.userCompany = companies;
                this.getDefaultGroup(this.selectedCompany.OrgGroups);
            }
            else {
                companies.forEach(company => {
                    if (company.IsDefaultCompany) {
                        this.selectedCompany = company;
                        this.selectedCompany.IsSelected = true;
                        this.selectedCompanyName = this.selectedCompany.CompanyName;
                        this.userCompany = companies;
                        this.userGroups = company.OrgGroups;
                        this.getDefaultGroup(this.userGroups);
                        // this.groupCount = this.userGroups.length;
                        // this.nodeCount = 0;
                    }
                });
            }
        }
    }

    getDefaultGroup(userGroups) {
        if (userGroups) {
            let groups: OrgGroupModel[] = userGroups;
            if (groups.length && groups.length <= 1) {
                this.selectedGroup = groups[0];
                this.selectedGroupName = this.selectedGroup.GroupName;
                this.selectedGroup.IsSelected = true;
                this.userGroups = groups;
            }
            else {
                groups.forEach(group => {
                    if (group && group.IsDefaultGroup) {
                        this.selectedGroup = group;
                        this.selectedGroupName = this.selectedGroup.GroupName;
                        this.selectedGroup.IsSelected = true;
                    }
                });
            }
        }
    }

    onCompanySelection(data) {
        if (data) {
            this.selectedCompany.IsSelected = false;
            this.selectedCompany = data;
            this.selectedCompany.IsSelected = true;
        }
    }

    onGroupSelection(data) {
        if (data) {
            this.selectedGroup.IsSelected = false;
            this.selectedGroup = data;
            this.selectedGroup.IsSelected = true;
        }
    }

    OnClickOfGroupSetting() {
        this.selectedGroupName = this.selectedGroup.GroupName;
        let modal = document.getElementById("groupSettings");
        modal.style.display = "block";
    }

    closeGroupSetting() {
        this.selectedGroupName = this.selectedGroup.GroupName;
        let modal = document.getElementById("groupSettings");
        modal.style.display = "none";
    }

    OnClickOfCompanySetting() {
        this.selectedCompanyName = this.selectedCompany.CompanyName;
        let modal = document.getElementById("companySettings");
        modal.style.display = "block";
    }

    closeCompanySetting() {
        this.selectedCompanyName = this.selectedCompany.CompanyName;
        let modal = document.getElementById("companySettings");
        modal.style.display = "none";
    }

    onGroupSave() {
        let group = new OrgGroupModel();
        group.CompanyID = this.selectedGroup.CompanyID;
        group.IsDefaultGroup = this.selectedGroup.IsDefaultGroup;
        group.OrgGroupID = this.selectedGroup.OrgGroupID;
        group.GroupName = this.selectedGroupName;
        group.OrgNodes = null;
        this.updateGroup(group);
    }

    onCompanySave() {
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

    updateGroup(data) {
        if (data) {
            this.orgService.updateGroup(data)
                .subscribe(data => this.setGroupData(data),
                err => this.orgService.logError(err));
        }
    }

    setCompanyData(data) {
        if (data) {
            this.selectedCompany = data;
            this.userCompany.forEach(company => {
                this.updateOrgCompany(company, data);
            });
            // this.updateOrgCompanies.emit(this.userCompany);
        }
    }

    setGroupData(data) {
        if (data) {
            this.selectedGroup = data;
            this.userGroups.forEach(group => {
                this.updateOrgGroup(group, data);
            });
            //  this.updateOrgGroups.emit(this.userGroups);
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