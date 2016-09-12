import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from "@angular/core";
import { Router } from "@angular/router-deprecated";

import { OrgCompanyModel, OrgGroupModel, OrgNodeModel, OrgService, OrgNodeBaseModel} from "../shared/index";
import { DataHelper } from "../data-helper/data-helper";
import { UserModel } from "../../Shared/index";
import { ImportCsvFileComponent } from "../import-csv-file/import-csv-file.component";

declare let $: any;

@Component({
    selector: "sg-menu-panel",
    templateUrl: "app/org/menu-panel/menu-panel.component.html",
    styleUrls: ["app/org/menu-panel/menu-panel.component.css"],
    directives: [ImportCsvFileComponent],
    providers: [DataHelper]
})

export class MenuPanelComponent implements OnChanges {
    private orgCompanies: OrgCompanyModel[];
    private orgCompanyGroups: OrgGroupModel[];
    private selectedCompany: OrgCompanyModel;
    private selectedGroup: OrgGroupModel;
    private userModel: UserModel;
    private selectedGroupName: any;
    private selectedCompanyName: any;
    private newGroupName: any;
    private newCompanyName: any;
    private groupSettingTitle: any;
    private isImport: boolean;
    private enableImport: boolean;

    @Input() noNodeExsit: boolean;
    @Output() orgNodes = new EventEmitter<any>();
    @Output() groupSelected = new EventEmitter<OrgGroupModel>();
    @Output() companySelected = new EventEmitter<OrgCompanyModel>();

    constructor(private orgService: OrgService, private router: Router, private dataHelper: DataHelper) {
        this.getAllCompanies();
        this.enableImport = false;
        this.isImport = false;
        this.groupSettingTitle = "Settings";
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["noNodeExsit"] && changes["noNodeExsit"].currentValue) {
            this.enableImport = true;
        }
        else {
            this.enableImport = false;
        }
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
            this.selectedCompany = null;
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
                this.companySelected.emit(this.selectedCompany);
            }
        }
    }

    private setSelectedGroup(groups) {
        if (groups) {
            this.orgCompanyGroups = groups;
            this.selectedGroup = null;
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
            if (data.OrgNodes && data.OrgNodes.length === 0) {
                this.enableImport = true;
            } else {
                this.enableImport = false;
            }
            this.selectedGroup.OrgNodes = data.OrgNodes;
            this.selectedGroup.IsDefaultGroup = true;
            this.groupSelected.emit(this.selectedGroup);
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
            this.selectedCompany.IsDefaultCompany = true;
            this.companySelected.emit(this.selectedCompany);
            this.setSelectedGroup(this.selectedCompany.OrgGroups);
            this.orgService.setDefaultCompany(this.userModel.UserID, this.selectedCompany.CompanyID)
                .subscribe(data => { },
                err => this.orgService.logError(err));
        }
    }

    private onGroupSelection(data) {
        if (this.selectedGroup.OrgGroupID !== data.OrgGroupID) {
            this.selectedGroup.IsDefaultGroup = false;
            this.setGroupData(this.selectedGroup);
        }
        if (data && data.OrgGroupID !== this.selectedGroup.OrgGroupID) {
            this.selectedGroup = data;
            this.selectedGroup.IsDefaultGroup = true;
            this.getAllNodes(data.OrgGroupID);
            this.orgService.setDefaultGroup(this.userModel.UserID, this.selectedCompany.CompanyID, this.selectedGroup.OrgGroupID)
                .subscribe(data => { },
                err => this.orgService.logError(err));
        }
    }

    private onAddOrSettingsClick(name) {
        if (name === "company") {
            this.selectedCompanyName = this.selectedCompany.CompanyName;
            $("#companySettings").show();
        } else if (name === "group") {
            this.selectedGroupName = this.selectedGroup.GroupName;
            $("#groupSettings").show();
        } else if (name === "newGroup") {
            this.newGroupName = " ";
            $("#addNewGroup").show();
        } else if (name === "newCompany") {
            this.newCompanyName = " ";
            $("#addNewCompany").show();
        }
    }

    private dismissPopup(name) {
        if (name === "company") {
            this.selectedCompanyName = this.selectedCompany.CompanyName;
            $("#companySettings").hide();
        } else if (name === "group") {
            this.selectedGroupName = this.selectedGroup.GroupName;
            $("#groupSettings").hide();
            this.isImport = false;
            this.groupSettingTitle = "Settings";
        } else if (name === "newGroup") {
            this.newGroupName = " ";
            $("#addNewGroup").hide();
        } else if (name === "newCompany") {
            this.newCompanyName = " ";
            $("#addNewCompany").hide();
        }
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

    private addNewGroup() {
        let group = new OrgGroupModel();
        let userID = this.userModel.UserID;
        group.CompanyID = this.selectedCompany.CompanyID;
        group.GroupName = this.newGroupName;
        group.OrgNodes = null;

        this.orgService.addGroup(group, userID)
            .subscribe(data => {
                this.setNewGroup(data);
            },
            err => this.orgService.logError(err));

    }

    private addNewCompany() {
        let userID = this.userModel.UserID;
        let company = new OrgCompanyModel();
        company.CompanyName = this.newCompanyName;
        company.OrgGroups = null;

        this.orgService.addCompany(company, userID)
            .subscribe(data => {
                this.setNewCompany(data);
            },
            err => this.orgService.logError(err));

    }

    private setNewCompany(data) {
        this.selectedCompany = data;
        this.selectedCompany.IsDefaultCompany = true;
        this.orgCompanies.push(this.selectedCompany);
        this.companySelected.emit(this.selectedCompany);
        this.setSelectedGroup(this.selectedCompany.OrgGroups);
    }


    private setNewGroup(data) {
        if (data) {
            this.selectedGroup.IsDefaultGroup = false;
            this.setGroupData(this.selectedGroup);
            this.selectedGroup = data;
            this.selectedGroup.IsDefaultGroup = true;
            this.orgCompanyGroups.push(this.selectedGroup);
            this.getAllNodes(this.selectedGroup.OrgGroupID);
        }
    }

    private setGroupData(data) {
        if (data) {
            let isDefault = this.selectedGroup.IsDefaultGroup;
            this.selectedGroup = data;
            this.selectedGroup.IsDefaultGroup = isDefault;
            this.orgCompanyGroups.forEach(group => {
                if (this.compareGroupID(group, data)) {
                    group.CompanyID = data.CompanyID;
                    group.GroupName = data.GroupName;
                    group.IsDefaultGroup = isDefault;
                    group.OrgGroupID = data.OrgGroupID;
                    // group.IsSelected = true;
                    return true;
                }
            });
        }
    }

    private onCompanySave() {
        let company = new OrgCompanyModel();
        company.CompanyID = this.selectedCompany.CompanyID;
        company.CompanyName = this.selectedCompanyName;
        company.DateCreated = this.selectedCompany.DateCreated;
        company.IsDefaultCompany = this.selectedCompany.IsDefaultCompany;
        company.OrgGroups = null;

        this.orgService.updateCompany(company)
            .subscribe(data => this.setCompanyData(data),
            err => this.orgService.logError(err));
    }

    private setCompanyData(data) {
        if (data) {
            this.selectedCompany.CompanyName = data.CompanyName;
            this.orgCompanies.forEach(company => {
                if (this.compareCompanyID(company, data)) {
                    company.CompanyName = data.CompanyName;
                    company.DateCreated = data.DateCreated;
                    // company.OrgGroups = data.OrgGroups;
                    // company.IsSelected = true;
                    return true;
                }
            });
            this.companySelected.emit(this.selectedCompany);
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

    private onClickOnImport() {
        this.groupSettingTitle = "Import";
        this.isImport = true;
    }

    updateNewOrgGroup(OrgNodes) {
        this.setOrgGroupData(OrgNodes);
        this.groupSettingTitle = "Settings";
        this.isImport = false;
    }
    private onDeleteCompany() {
        let companyID = this.selectedCompany.CompanyID;
        this.orgService.deleteCompany(companyID)
            .subscribe(data => this.deleteOrgCompany(data),
            err => this.orgService.logError(err));
    }

    private deleteOrgCompany(data) {
        if (data) {
            this.orgCompanies.forEach((company, index) => {
                if (this.compareCompanyID(company, this.selectedCompany)) {
                    this.orgCompanies.splice(index, 1);
                }
            });
            if (this.orgCompanies && this.orgCompanies.length === 0) {
                this.newCompanyName = "My Organization";
                this.addNewCompany();
            } else {
                this.orgCompanies.forEach((company, index) => {
                    if (company.IsDefaultCompany) {
                        this.selectedCompany = company;
                        this.setSelectedGroup(this.selectedCompany.OrgGroups);
                    } else {
                        this.selectedCompany = this.orgCompanies[0];
                        this.setSelectedGroup(this.selectedCompany.OrgGroups);
                    }
                });
            }
            this.companySelected.emit(this.selectedCompany);
            this.dismissPopup("company");
        }
    }

    private onDeleteGroup() {
        let groupID = this.selectedGroup.OrgGroupID;
        this.orgService.deleteGroup(groupID)
            .subscribe(data => this.deleteOrgGroup(data),
            err => this.orgService.logError(err));
    }

    private deleteOrgGroup(data) {
        if (data) {
            this.selectedCompany.OrgGroups.forEach((group, index) => {
                if (this.compareGroupID(group, this.selectedGroup)) {
                    this.selectedCompany.OrgGroups.splice(index, 1);
                }
            });
            this.orgCompanyGroups = this.selectedCompany.OrgGroups;
            if (this.orgCompanyGroups && this.orgCompanyGroups.length === 0) {
                this.newGroupName = "My Group";
                this.addNewGroup();
            } else {
                this.orgCompanyGroups.forEach((group) => {
                    if (group.IsDefaultGroup) {
                        this.selectedGroup = group;
                        this.getAllNodes(this.selectedGroup.OrgGroupID);
                    }
                    else {
                        this.selectedGroup = this.orgCompanyGroups[0];
                        this.getAllNodes(this.selectedGroup.OrgGroupID);
                    }
                });
            }
            this.groupSelected.emit(this.selectedGroup);
            this.dismissPopup("group");
        }
    }
    private onClickDownloadTemplate() {
        // If JSONData is not an object then JSON.parse will parse the JSON string in an Object       
        let orgNode = new OrgNodeBaseModel();
        let node = this.dataHelper.convertDataToBaseModel(orgNode);
        let CSV = "";

        if (node) {
            let row = this.dataHelper.getCSVFileHeaders(node);

            // append Label row with line break
            CSV += row + "\r\n";
        }

        this.dataHelper.downloadCSVFile("PeopleTree_Template", CSV);
    }
}