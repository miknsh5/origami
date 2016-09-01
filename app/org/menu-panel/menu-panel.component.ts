import { Component, Input, Output, EventEmitter } from "@angular/core";
import { NgControl  } from "@angular/forms";
import { CanActivate, Router } from "@angular/router-deprecated";

import { OrgCompanyModel, OrgGroupModel, OrgNodeModel, OrgService} from "../shared/index";
import { UserModel } from "../../Shared/index";

declare let $: any;

@Component({
    selector: "sg-menu-panel",
    templateUrl: "app/org/menu-panel/menu-panel.component.html",
    styleUrls: ["app/org/menu-panel/menu-panel.component.css"]
})

export class MenuPanelComponent {
    private orgCompanies: OrgCompanyModel[];
    private orgCompanyGroups: OrgGroupModel[];
    private selectedCompany: OrgCompanyModel;
    private selectedGroup: OrgGroupModel;
    private userModel: UserModel;
    private selectedGroupName: any;
    private selectedCompanyName: any;
    private newGroupName: any;
    private newCompanyName: any;
    private json: any;
    private rootNode = [];
    private groupSettingTitle: any;
    private isImport: boolean;
    private enableImport: boolean;
    private fileName: any;
    private mappedNodesCount: any;
    private unmappedNodesCount: any;
    private nodeName: any;

    @Output() orgNodes = new EventEmitter<any>();

    @Output() groupSelected = new EventEmitter<OrgGroupModel>();
    @Output() companySelected = new EventEmitter<OrgCompanyModel>();

    constructor(private orgService: OrgService, private router: Router) {
        this.getAllCompanies();
        this.enableImport = false;
        this.isImport = false;
        this.groupSettingTitle = "Settings";
        this.fileName = "";
        this.mappedNodesCount = 0;
        this.unmappedNodesCount = 0;
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
                this.companySelected.emit(this.selectedCompany);
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
            if (data.OrgNodes && data.OrgNodes.length === 0) {
                this.enableImport = true;
            } else {
                this.enableImport = false;
            }
            this.selectedGroup.OrgNodes = data.OrgNodes;
            this.selectedGroup.IsSelected = true;
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
        this.selectedGroup.IsDefaultGroup = false;
        this.setGroupData(this.selectedGroup);
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
            let modal = document.getElementById("companySettings");
            modal.style.display = "block";
        } else if (name === "group") {
            this.selectedGroupName = this.selectedGroup.GroupName;
            let modal = document.getElementById("groupSettings");
            modal.style.display = "block";
        } else if (name === "newGroup") {
            this.newGroupName = " ";
            let modal = document.getElementById("addNewGroup");
            modal.style.display = "block";
        } else if (name === "newCompany") {
            this.newCompanyName = " ";
            let modal = document.getElementById("addNewCompany");
            modal.style.display = "block";
        }
    }

    private dismissPopup(name) {
        if (name === "company") {
            this.selectedCompanyName = this.selectedCompany.CompanyName;
            let modal = document.getElementById("companySettings");
            modal.style.display = "none";
        } else if (name === "group") {
            this.selectedGroupName = this.selectedGroup.GroupName;
            let modal = document.getElementById("groupSettings");
            modal.style.display = "none";
            this.isImport = false;
            this.groupSettingTitle = "Settings";
        } else if (name === "newGroup") {
            this.newGroupName = " ";
            let modal = document.getElementById("addNewGroup");
            modal.style.display = "none";
        } else if (name === "newCompany") {
            this.newCompanyName = " ";
            let modal = document.getElementById("addNewCompany");
            modal.style.display = "none";
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
                    group.IsSelected = true;
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
                    company.IsSelected = true;
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

    private onImport(event) {
        let modalImportFile = document.getElementById("importFile");
        modalImportFile.style.display = "none";
        let modalLoadScreen = document.getElementById("loadScreen");
        modalLoadScreen.style.display = "block";
        let files = (event.srcElement || event.target).files[0];
        this.fileName = files.name;
        if (!files) {
            alert("The File APIs are not fully supported in this browser!");
        } else {
            let data = null;
            let file = files;
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onload = (event) => {
                let csvData = event.target["result"];
                this.CSV2JSON(csvData);
                modalLoadScreen.style.display = "none";
                let modalConfirmImport = document.getElementById("confirmImport");
                modalConfirmImport.style.display = "block";

            };
            reader.onerror = function () {
                alert("Unable to read " + file.fileName);
            };
        }
    }

    private CSVToArray(strData, strDelimiter): any {
        let strMatchedValue = "";
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");
        // Create a regular expression to parse the CSV values.
        let objPattern = new RegExp((
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
        // Create an array to hold our data. Give the array
        // a default empty first row.
        let arrData = [[]];
        // Create an array to hold our individual pattern
        // matching groups.
        let arrMatches = null;
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {
            // Get the delimiter that was found.
            let strMatchedDelimiter = arrMatches[1];
            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);
            }
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).

            if (arrMatches[2]) {
                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[2].replace(
                    new RegExp("\"\"", "g"), "\"");
            } else {
                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];
            }
            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
        }
        // Return the parsed data.
        return (arrData);
    }
    private convertBaseModelToData(node): OrgNodeModel {
        let orgNode = new OrgNodeModel();
        if (node) {
            orgNode.NodeID = node.UID;
            orgNode.NodeFirstName = node.First_Name;
            orgNode.NodeLastName = node.Last_Name;
            orgNode.Description = node.Title;
            orgNode.ParentNodeID = node.Parent;
            if ((orgNode.ParentNodeID).toString() === "null") {
                this.nodeName = orgNode.NodeFirstName + " " + orgNode.NodeLastName;
                this.unmappedNodesCount++;
            } else {
                this.mappedNodesCount++;
            }

        }
        if ((orgNode.ParentNodeID).toString() === "null") {
            orgNode.children = new Array<OrgNodeModel>();

        }
        return orgNode;
    }

    onConfirm() {
        this.orgService.addGroupNodes(this.selectedGroup.OrgGroupID, this.json)
            .subscribe(data => this.setOrgGroupData(data),
            err => this.orgService.logError(err));
        this.dismissPopup("group");
        let modalConfirmImport = document.getElementById("confirmImport");
        modalConfirmImport.style.display = "none";
        this.nodeName = " ";
        this.unmappedNodesCount = 0;
        this.mappedNodesCount = 0;
    }

    private onCancelImport() {
        let modalImportFile = document.getElementById("importFile");
        modalImportFile.style.display = "block";
        let modalLoadScreen = document.getElementById("loadScreen");
        modalLoadScreen.style.display = "none";
        let modalConfirmImport = document.getElementById("confirmImport");
        modalConfirmImport.style.display = "none";
        this.nodeName = " ";
        this.unmappedNodesCount = 0;
        this.mappedNodesCount = 0;
    }

    private CSV2JSON(csv) {
        let array = this.CSVToArray(csv, ",");
        let objArray = [];
        for (let i = 1; i < array.length; i++) {
            objArray[i - 1] = {};
            for (let k = 0; k < array.length; k++) {
                let key = array[0][k];
                if (key === "First Name") {
                    key = key.replace(" ", "_");
                }
                if (key === "Last Name") {
                    key = key.replace(" ", "_");
                }
                objArray[i - 1][key] = array[i][k];
            }
        }

        objArray.forEach((node) => {
            if (node.UID !== "") {
                this.rootNode.push(this.convertBaseModelToData(node));
            }
        });
        this.unmappedNodesCount = this.unmappedNodesCount - 1;
        this.json = JSON.stringify(this.rootNode);
        this.json = this.json.replace(/},/g, "},\r\n");
        this.json = JSON.parse(this.json);
    }
}