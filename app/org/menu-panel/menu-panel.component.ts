import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from "@angular/core";
import { Router } from "@angular/router";

import { OrgCompanyModel, OrgGroupModel, OrgNodeModel, OrgService, OrgNodeStatus, OrgNodeBaseModel} from "../shared/index";
import { CSVConversionHelper } from "../shared/csv-helper";
import { UserModel } from "../../Shared/index";

import { AuthService } from "../../login/index";

declare let $: any;

@Component({
    selector: "sg-menu-panel",
    templateUrl: "app/org/menu-panel/menu-panel.component.html",
    styleUrls: ["app/org/menu-panel/menu-panel.component.css"],
    providers: [CSVConversionHelper]
})

export class MenuPanelComponent implements OnChanges {
    private orgCompanies: OrgCompanyModel[];
    private orgCompanyGroups: OrgGroupModel[];
    private selectedCompany: OrgCompanyModel;
    private selectedGroup: OrgGroupModel;
    private userModel: UserModel;
    private groupName: any;
    private companyName: any;
    private groupSettingTitle: any;
    private isImport: boolean;
    private enableImport: boolean;
    private $onCompanyDelete: any;
    private $companyBody: any;
    private $groupName: any;
    private $importAndTemplate: any;
    private $onGroupDelete: any;

    @Input() noNodeExsit: boolean;
    @Input() currentOrgNodeStatus: OrgNodeStatus;
    @Output() orgNodes = new EventEmitter<any>();
    @Output() groupSelected = new EventEmitter<OrgGroupModel>();
    @Output() companySelected = new EventEmitter<OrgCompanyModel>();
    @Output() isMenuEnable = new EventEmitter<boolean>();
    @Output() isSettings: boolean;

    constructor(private orgService: OrgService, private router: Router,
        private csvHelper: CSVConversionHelper, private auth: AuthService) {
        this.getAllCompanies();
        this.enableImport = false;
        this.isImport = false;
        this.groupSettingTitle = "Settings";
        this.$onCompanyDelete = "#companyDelete";
        this.$companyBody = "#companySetting";
        this.$groupName = "#groupName";
        this.$importAndTemplate = "#importAndTemplate";
        this.$onGroupDelete = "#groupDelete";

    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["currentOrgNodeStatus"]) {
            if (this.currentOrgNodeStatus === OrgNodeStatus.Add) {
                this.selectedCompany.OrgNodeCounts = this.selectedCompany.OrgNodeCounts + 1;
                this.selectedGroup.OrgNodeCounts = this.selectedGroup.OrgNodeCounts + 1;
            } else if (this.currentOrgNodeStatus === OrgNodeStatus.Delete) {
                this.selectedCompany.OrgNodeCounts = this.selectedCompany.OrgNodeCounts - 1;
                this.selectedGroup.OrgNodeCounts = this.selectedGroup.OrgNodeCounts - 1;
                if (this.selectedGroup.OrgNodeCounts === 0) {
                    this.enableImport = true;
                }
            } else {
                return;
            }
        }

        if (changes["noNodeExsit"]) {
            if (changes["noNodeExsit"].currentValue) {
                this.enableImport = true;
            } else {
                this.enableImport = false;
            }
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
        this.isSettings = true;
        this.isMenuEnable.emit(true);
        if (name === "company") {
            this.companyName = this.selectedCompany.CompanyName;
            $("#companySettings").show();
        } else if (name === "group") {
            this.groupName = this.selectedGroup.GroupName;
            $("#groupSettings").show();
        } else if (name === "newGroup") {
            this.groupName = "";
            $("#addNewGroup").show();
        } else if (name === "newCompany") {
            this.companyName = "";
            $("#addNewCompany").show();
        }
    }

    private dismissPopup(name) {
        this.isSettings = false;
        this.isMenuEnable.emit(false);
        if (name === "company") {
            this.companyName = this.selectedCompany.CompanyName;
            $("#companySettings").hide();
        } else if (name === "group") {
            this.groupName = this.selectedGroup.GroupName;
            $("#groupSettings").hide();
            this.isImport = false;
            this.groupSettingTitle = "Settings";
        } else if (name === "newGroup") {
            this.groupName = "";
            $("#addNewGroup").hide();
        } else if (name === "newCompany") {
            this.companyName = "";
            $("#addNewCompany").hide();
        }
    }

    private onGroupSave() {
        let group = new OrgGroupModel();
        group.CompanyID = this.selectedGroup.CompanyID;
        group.IsDefaultGroup = this.selectedGroup.IsDefaultGroup;
        group.OrgGroupID = this.selectedGroup.OrgGroupID;
        group.GroupName = this.groupName.trim();
        group.OrgNodes = null;

        this.orgService.updateGroup(group)
            .subscribe(data => this.setGroupData(data),
            err => this.orgService.logError(err));
    }

    private addNewGroup() {
        let group = new OrgGroupModel();
        let userID = this.userModel.UserID;
        group.CompanyID = this.selectedCompany.CompanyID;
        group.GroupName = this.groupName.trim();
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
        company.CompanyName = this.companyName.trim();
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
            let orgCount = this.selectedGroup.OrgNodeCounts;
            this.selectedGroup = data;
            this.selectedGroup.IsDefaultGroup = isDefault;
            this.selectedGroup.OrgNodeCounts = orgCount;
            this.orgCompanyGroups.forEach(group => {
                if (this.compareGroupID(group, data)) {
                    group.CompanyID = data.CompanyID;
                    group.GroupName = data.GroupName;
                    group.IsDefaultGroup = isDefault;
                    group.OrgGroupID = data.OrgGroupID;
                    return true;
                }
            });
        }
    }

    private onCompanySave() {

        let company = new OrgCompanyModel();
        company.CompanyID = this.selectedCompany.CompanyID;
        company.CompanyName = this.companyName.trim();
        company.DateCreated = this.selectedCompany.DateCreated;
        company.IsDefaultCompany = this.selectedCompany.IsDefaultCompany;
        company.OrgGroups = null;

        this.orgService.updateCompany(company)
            .subscribe(data => this.setCompanyData(data),
            err => this.orgService.logError(err));

    }

    private setCompanyData(data) {
        if (data) {
            let orgCount = this.selectedCompany.OrgNodeCounts;
            this.selectedCompany.CompanyName = data.CompanyName;
            this.selectedCompany.OrgNodeCounts = orgCount;
            this.orgCompanies.forEach(company => {
                if (this.compareCompanyID(company, data)) {
                    company.CompanyName = data.CompanyName;
                    company.DateCreated = data.DateCreated;
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

    private updateNewOrgGroup(OrgNodes) {
        this.setOrgGroupData(OrgNodes);
        this.selectedGroup.OrgNodeCounts = OrgNodes.OrgNodeCounts;
        this.selectedCompany.OrgNodeCounts = this.selectedCompany.OrgNodeCounts + this.selectedGroup.OrgNodeCounts;
        this.groupSettingTitle = "Settings";
        this.isImport = false;
    }

    private onDeleteCompany() {
        $(this.$onCompanyDelete).show();
        $(this.$companyBody).hide();
        $("#deleteCompany").hide();
    }

    onCompanyDeleteConfirm(data) {
        if (data) {
            let companyID = this.selectedCompany.CompanyID;
            this.orgService.deleteCompany(companyID)
                .subscribe(data => this.deleteOrgCompany(data),
                err => this.orgService.logError(err));
            $(this.$onCompanyDelete).hide();
            $("#deleteCompany").show();
            $(this.$companyBody).show();
        }
    }

    onCompanyDeleteCancel(data) {
        if (data) {
            $(this.$onCompanyDelete).hide();
            $("#deleteCompany").show();
            $(this.$companyBody).show();
        }
    }

    private deleteOrgCompany(data) {
        if (data) {
            this.orgCompanies.forEach((company, index) => {
                if (this.compareCompanyID(company, this.selectedCompany)) {
                    this.orgCompanies.splice(index, 1);
                }
            });
            if (this.orgCompanies && this.orgCompanies.length === 0) {
                this.companyName = "My Organization";
                this.addNewCompany();
            } else {
                this.setCompanies(this.orgCompanies);
            }
            this.dismissPopup("company");
        }
    }

    private onDeleteGroup() {

        $(this.$groupName).hide();
        $(this.$importAndTemplate).hide();
        $(this.$onGroupDelete).show();
        $("#deleteGroup").hide();
    }

    onGroupDeleteConfirm(data: boolean) {
        if (data) {
            let groupID = this.selectedGroup.OrgGroupID;
            this.orgService.deleteGroup(groupID)
                .subscribe(data => this.deleteOrgGroup(data),
                err => this.orgService.logError(err));
        }
        $(this.$groupName).show();
        $(this.$importAndTemplate).show();
        $("#deleteGroup").show();
        $(this.$onGroupDelete).hide();
    }

    onGroupDeleteCancel(data: boolean) {
        if (data) {
            $(this.$groupName).show();
            $(this.$importAndTemplate).show();
            $("#deleteGroup").show();
            $(this.$onGroupDelete).hide();
        }
    }

    private deleteOrgGroup(data) {
        if (data) {
            this.selectedCompany.OrgNodeCounts = this.selectedCompany.OrgNodeCounts - this.selectedGroup.OrgNodeCounts;
            this.selectedCompany.OrgGroups.forEach((group, index) => {
                if (this.compareGroupID(group, this.selectedGroup)) {
                    this.selectedCompany.OrgGroups.splice(index, 1);
                }
            });
            this.orgCompanyGroups = this.selectedCompany.OrgGroups;
            if (this.orgCompanyGroups && this.orgCompanyGroups.length === 0) {
                this.groupName = "My Group";
                this.addNewGroup();
            } else {
                this.setSelectedGroup(this.orgCompanyGroups);
            }
            this.dismissPopup("group");
        }
    }

    private onClickDownloadTemplate() {
        this.csvHelper.DownloadTemplate();
    }
}