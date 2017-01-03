import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange, Renderer } from "@angular/core";
import { Router } from "@angular/router";

import {
    AuthService, UserModel, OrgCompanyModel, OrgGroupModel, OrgNodeModel,
    OrgService, OrgNodeStatus, OrgNodeBaseModel, DomElementHelper, CSVConversionHelper
} from "../../shared/index";

const MenuElement = {
    groupName: "#groupName",
    importTemplate: "#importAndTemplate",
    groupModal: "#groupSettingsModal",
    deleteGroup: "#deleteGroup",
    confirmGroupDelete: "#deleteGroupConfirm",
    groupSaveOrEdit: "#groupSaveOrEdit",
    groupDeleteLoader: "#groupDeleteLoader",
    exportData: "#exportData",
    downloadTemplate: "#downloadTemplate"
};

@Component({
    selector: "sg-menu-panel",
    templateUrl: "app/ui/menu-bar/menu-bar.component.html",
    styleUrls: ["app/ui/menu-bar/menu-bar.component.css"],
    providers: [CSVConversionHelper]
})

export class MenuBarComponent implements OnChanges {
    private orgCompanies: OrgCompanyModel[];
    private orgCompanyGroups: OrgGroupModel[];
    private selectedCompany: OrgCompanyModel;
    private selectedGroup: OrgGroupModel;
    private userModel: UserModel;
    private groupName: any;
    private companyName: any;
    private groupSettingTitle: any;
    private isImport: boolean;
    private groupSelectedMode: any;
    private isImportDisabled: boolean;


    @Input() noNodeExsit: boolean;
    @Input() currentOrgNodeStatus: OrgNodeStatus;
    @Input() orgNodes: Array<OrgNodeModel>;
    @Output() groupSelected = new EventEmitter<OrgGroupModel>();
    @Output() isMenuEnable = new EventEmitter<boolean>();
    @Output() deleteTitle: string;
    @Output() name: string;

    constructor(private orgService: OrgService, private router: Router, private renderer: Renderer,
        private csvHelper: CSVConversionHelper, private auth: AuthService, private domHelper: DomElementHelper) {
        this.getAllCompanies();
        this.domHelper.showElements(MenuElement.exportData);
        this.domHelper.hideElements(MenuElement.downloadTemplate);
        this.isImport = false;
        this.groupSettingTitle = "Settings";
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
                    this.domHelper.showElements(MenuElement.downloadTemplate);
                    this.domHelper.hideElements(MenuElement.exportData);
                }
            } else {
                return;
            }
        }

        if (changes["orgNodes"] && changes["orgNodes"].currentValue) {
            this.selectedGroup.OrgNodes = this.orgNodes;
            if (this.selectedGroup.OrgNodes.length === 0) {
                this.domHelper.showElements(MenuElement.downloadTemplate);
                this.domHelper.hideElements(MenuElement.exportData);
            } else {
                this.domHelper.showElements(MenuElement.exportData);
                this.domHelper.hideElements(MenuElement.downloadTemplate);

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
            } else {
                this.companyName = "My Organization";
                this.addNewCompany();
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
            } else {
                this.groupName = `Organization ${(this.selectedCompany.OrgGroups.length + 1)}`;
                this.groupSelectedMode = "AddNewGroup";
                this.onGroupSave();
            }
        }
    }

    private getAllNodes(groupID) {
        let profile = localStorage.getItem("profile");
        if (profile) {
            this.orgService.getOrgNodes(groupID)
                .subscribe(data => this.setOrgGroupData(data),
                err => this.orgService.logError(err),
                () => console.log("Fetched all nodes."));
        }
    }

    private setOrgGroupData(data: any) {
        if (data) {
            if (data.OrgNodes && data.OrgNodes.length === 0) {
                this.domHelper.showElements(MenuElement.downloadTemplate);
                this.domHelper.hideElements(MenuElement.exportData);
            } else {
                this.domHelper.showElements(MenuElement.exportData);
                this.domHelper.hideElements(MenuElement.downloadTemplate);
            }
            this.selectedGroup.OrgNodes = data.OrgNodes;
            this.selectedGroup.IsDefaultGroup = true;
            this.groupSelected.emit(this.selectedGroup);
            this.enableDropDowns();
        }
    }

    private enableDropDowns() {
        this.domHelper.initDropDown(".dropdown-button", { constrain_width: false, alignment: "right" });
        this.domHelper.initDropDown(".organization", { constrain_width: false, belowOrigin: true, alignment: "left" });
        this.domHelper.initDropDown(".group", { constrain_width: false, belowOrigin: true, alignment: "left" });
    }

    private onCompanySelection(data) {
        if (data && data.CompanyID !== this.selectedCompany.CompanyID) {
            this.selectedCompany = data;
            this.selectedCompany.IsDefaultCompany = true;
            this.setSelectedGroup(this.selectedCompany.OrgGroups);
            this.orgService.setDefaultCompany(this.userModel.UserID, this.selectedCompany.CompanyID)
                .subscribe(data => { },
                err => this.orgService.logError(err));
        }
    }

    private onGroupSelection(data) {
        if (this.selectedGroup.OrgGroupID !== data.OrgGroupID) {
            this.selectedGroup.IsDefaultGroup = false;
        }
        if (data && data.OrgGroupID !== this.selectedGroup.OrgGroupID) {
            this.selectedGroup = data;
            this.selectedGroup.IsDefaultGroup = true;
            this.getAllNodes(data.OrgGroupID);
            this.orgService.setDefaultGroup(this.userModel.UserID, this.selectedCompany.CompanyID, this.selectedGroup.OrgGroupID)
                .subscribe(data => { }, err => this.orgService.logError(err));
        }
    }

    private onAddOrSettingsClick(name: string, groupData?: OrgNodeModel) {
        this.isMenuEnable.emit(true);
        let element = null;
        if (name.toLowerCase() === "group") {
            this.groupSelectedMode = "Settings";
            this.groupSettingTitle = "Settings";
            this.onGroupSelection(groupData);
            this.isImportDisabled = false;
            this.groupName = this.selectedGroup.GroupName;
            this.domHelper.showElements([MenuElement.groupModal, MenuElement.deleteGroup]);
            this.domHelper.hideElements([MenuElement.confirmGroupDelete, MenuElement.groupDeleteLoader]);
            if (this.selectedGroup && this.selectedGroup.OrgNodes.length === 0) {
                this.domHelper.showElements(MenuElement.downloadTemplate);
                this.domHelper.hideElements(MenuElement.exportData);
            } else {
                this.domHelper.showElements(MenuElement.exportData);
                this.domHelper.hideElements(MenuElement.downloadTemplate);
            }
            element = document.querySelector("input[name=existingGroupName]");
        } else {
            this.groupSelectedMode = "AddNewGroup";
            this.groupSettingTitle = "Add New Organization";
            this.groupName = `Organization ${(this.selectedCompany.OrgGroups.length + 1)}`;
            this.isImportDisabled = true;
            this.domHelper.showElements([MenuElement.groupModal, MenuElement.importTemplate, MenuElement.downloadTemplate]);
            this.domHelper.hideElements([MenuElement.deleteGroup, MenuElement.groupDeleteLoader, MenuElement.exportData]);
            element = document.querySelector("input[name=existingGroupName]");
        }
        this.renderer.invokeElementMethod(element, "focus", []);
    }

    private dismissPopup() {
        this.deleteTitle = "";
        this.name = "";
        this.isMenuEnable.emit(false);
        this.domHelper.showElements([MenuElement.groupName, MenuElement.importTemplate, MenuElement.deleteGroup, MenuElement.groupSaveOrEdit]);
        this.domHelper.hideElements([MenuElement.groupModal, MenuElement.confirmGroupDelete]);
        this.groupName = this.selectedGroup.GroupName;
        this.isImport = false;
        this.groupSettingTitle = "";
        this.groupName = "";
        this.groupSelectedMode = "";
        this.isImportDisabled = true;
    }

    private onGroupSave() {
        if (this.groupSelectedMode === "Settings") {
            let group = new OrgGroupModel();
            group.CompanyID = this.selectedGroup.CompanyID;
            group.IsDefaultGroup = this.selectedGroup.IsDefaultGroup;
            group.OrgGroupID = this.selectedGroup.OrgGroupID;
            group.GroupName = this.groupName.trim();
            group.OrgNodes = null;

            this.orgService.updateGroup(group)
                .subscribe(data => {
                    if (data) {
                        this.selectedGroup.GroupName = data.GroupName;
                        this.groupSelected.emit(this.selectedGroup);
                    }
                },
                err => this.orgService.logError(err));
        } else if (this.groupSelectedMode === "AddNewGroup") {
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
            this.groupSelectedMode = "Settings";
            this.isImportDisabled = false;
        }
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
        this.setSelectedGroup(this.selectedCompany.OrgGroups);
    }

    private setNewGroup(data) {
        if (data) {
            this.selectedGroup.IsDefaultGroup = false;
            this.selectedGroup = data;
            this.selectedGroup.IsDefaultGroup = true;
            this.orgCompanyGroups.push(this.selectedGroup);
            this.getAllNodes(this.selectedGroup.OrgGroupID);
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
        if (!this.isImportDisabled) {
            this.domHelper.hideElements(MenuElement.groupSaveOrEdit);
            this.groupSettingTitle = "Import";
            this.isImport = true;
        }
    }

    private updateNewOrgGroup(OrgNodes) {
        this.selectedCompany.OrgNodeCounts = this.selectedCompany.OrgNodeCounts - this.selectedGroup.OrgNodeCounts;
        this.isMenuEnable.emit(false);
        this.domHelper.showElements(MenuElement.groupSaveOrEdit);
        this.domHelper.hideElements(MenuElement.groupModal);
        this.setOrgGroupData(OrgNodes);
        this.selectedGroup.OrgNodeCounts = OrgNodes.OrgNodeCounts;
        this.selectedCompany.OrgNodeCounts = this.selectedCompany.OrgNodeCounts + this.selectedGroup.OrgNodeCounts;
        this.groupSettingTitle = "Settings";
        this.isImport = false;
    }

    onDeleteGroupClicked() {
        this.deleteTitle = "Organization";
        this.name = this.selectedGroup.GroupName;
        this.domHelper.hideElements([MenuElement.groupName, MenuElement.importTemplate, MenuElement.deleteGroup, MenuElement.groupSaveOrEdit]);
        this.domHelper.showElements(MenuElement.confirmGroupDelete);
    }

    onGroupDeleteConfirm(data: boolean) {
        if (data) {
            let groupID = this.selectedGroup.OrgGroupID;
            this.orgService.deleteGroup(groupID)
                .subscribe(data => this.groupDeletion(data),
                err => this.orgService.logError(err),
                () => { this.domHelper.showElements(MenuElement.groupModal + " .close"); });
        }
        this.deleteTitle = "";
        this.name = "";
        this.domHelper.hideElements([MenuElement.confirmGroupDelete, MenuElement.groupModal + " .close"]);
        this.domHelper.showElements(MenuElement.groupDeleteLoader);
    }

    onGroupDeleteCancel(data: boolean) {
        if (data) {
            this.deleteTitle = "";
            this.name = "";
            this.domHelper.showElements([MenuElement.groupName, MenuElement.importTemplate, MenuElement.deleteGroup, MenuElement.groupSaveOrEdit]);
            this.domHelper.hideElements(MenuElement.confirmGroupDelete);
        }
    }

    private groupDeletion(data) {
        if (data) {
            this.selectedCompany.OrgNodeCounts = this.selectedCompany.OrgNodeCounts - this.selectedGroup.OrgNodeCounts;
            this.selectedCompany.OrgGroups.forEach((group, index) => {
                if (this.compareGroupID(group, this.selectedGroup)) {
                    this.selectedCompany.OrgGroups.splice(index, 1);
                }
            });
            this.orgCompanyGroups = this.selectedCompany.OrgGroups;
            if (this.orgCompanyGroups && this.orgCompanyGroups.length === 0) {
                this.groupName = `Organization ${(this.selectedCompany.OrgGroups.length + 1)}`;
                this.groupSelectedMode = "AddNewGroup";
                this.onGroupSave();
            } else {
                this.setSelectedGroup(this.orgCompanyGroups);
            }
            this.dismissPopup();
        }
    }

    private onClickDownloadTemplate() {
        if (!this.isImportDisabled) {
            this.csvHelper.DownloadTemplate();
        }
    }

}