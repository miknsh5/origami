import { Component, Input, Output, EventEmitter } from "@angular/core";

import { OrgGroupModel, OrgNodeModel, OrgService, DomElementHelper } from "../shared/index";
import { CSVConversionHelper } from "../shared/csv-helper";

const DEFAULT_EXTENSION: string = ".csv";
const DEFAULT_HEADERSTRING: string = "UID,First Name,Last Name,Title,Parent,";
const ImportElementName = {
    importfile: "#importFile",
    loadScreen: "#loadScreen",
    confirmImport: "#confirmImport",
    templateScreen: "#templateScreen",
    confirmParent: "#confirmParent",
    closeClass: ".close"
};

@Component({
    selector: "sg-org-import-csv-file",
    templateUrl: "app/org/import-csv-file/import-csv-file.component.html",
    styleUrls: ["app/org/import-csv-file/import-csv-file.component.css", "app/org/menu-panel/menu-panel.component.css"],
    providers: [CSVConversionHelper]
})

export class ImportCsvFileComponent {
    private fileName: any;
    private json: any;
    private rootNode = [];
    private defaultNode: any;
    private mappedNodesCount: any;
    private unmappedNodesCount: any;
    private hasMultipleParent: boolean;

    @Input() selectedGroup: OrgGroupModel;
    @Output() newOrgNodes = new EventEmitter<OrgNodeModel>();

    constructor(private orgService: OrgService, private csvHelper: CSVConversionHelper, private domHelper: DomElementHelper) {
        this.fileName = "";
        this.mappedNodesCount = 0;
        this.unmappedNodesCount = 0;
        this.hasMultipleParent = false;
        this.defaultNode = new OrgNodeModel();
    }

    private checkFileExtension(fileName: string): boolean {
        if (fileName) {
            if (DEFAULT_EXTENSION === fileName.substr((fileName.length - 4), fileName.length)) {
                return true;
            }
        }
        return false;
    }

    private onClickDownloadTemplate() {
        this.csvHelper.DownloadTemplate();
    }

    private onImport(event) {
        let files = (event.srcElement || event.target).files[0];
        if (files) {
            this.domHelper.hideElements(ImportElementName.importfile);
            this.domHelper.showElements(ImportElementName.loadScreen);
            this.fileName = files.name;
            let isFileCorrect = this.checkFileExtension(this.fileName);
            this.defaultNode = new OrgNodeModel();
            if (isFileCorrect) {
                let data = null;
                let file = files;
                let reader = new FileReader();
                reader.readAsText(file);
                reader.onload = (event) => {
                    let csvData = event.target["result"];
                    let isFileFormat = this.CSV2JSON(csvData);
                    this.domHelper.hideElements(ImportElementName.loadScreen);
                    if (isFileFormat) {
                        this.domHelper.showElements(ImportElementName.confirmImport);
                    } else {
                        this.domHelper.showElements(ImportElementName.templateScreen);
                    }
                };
                reader.onerror = function () {
                    alert("Unable to read " + file.fileName);
                };
            } else {
                this.domHelper.hideElements(ImportElementName.loadScreen);
                this.domHelper.showElements(ImportElementName.templateScreen);
            }
        }
    }

    onConfirm(data: boolean) {
        if (data) {
            if (this.unmappedNodesCount > 1) {
                this.orgService.addGroupNodes(this.selectedGroup.OrgGroupID, this.json, null)
                    .subscribe(data => this.setOrgGroupData(data),
                    err => this.orgService.logError(err),
                    () => { this.domHelper.showElements(ImportElementName.closeClass); });
            }
            else {
                this.orgService.addGroupNodes(this.selectedGroup.OrgGroupID, this.json, this.defaultNode.NodeID)
                    .subscribe(data => this.setOrgGroupData(data),
                    err => this.orgService.logError(err),
                    () => { this.domHelper.showElements(ImportElementName.closeClass); });
            }
            this.domHelper.hideElements([ImportElementName.confirmImport, ImportElementName.closeClass, "#cancelbtn"]);
            this.domHelper.showElements(ImportElementName.loadScreen);
            this.unmappedNodesCount = 0;
            this.mappedNodesCount = 0;
        }
    }

    private setOrgGroupData(data) {
        this.domHelper.hideElements("#groupSettings");
        this.newOrgNodes.emit(data);
    }

    private onCancelImport(data: boolean) {
        if (data) {
            this.domHelper.showElements(ImportElementName.importfile);
            this.domHelper.hideElements([ImportElementName.templateScreen, ImportElementName.loadScreen, ImportElementName.confirmImport, ImportElementName.confirmParent]);

            this.unmappedNodesCount = 0;
            this.mappedNodesCount = 0;
            this.hasMultipleParent = false;
        }
    }

    private CSVToArray(strData): any {
        let strMatchedValue = "";
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        let strDelimiter = ",";
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
            orgNode.NodeID = parseInt(node.UID);
            orgNode.NodeFirstName = node.First_Name;
            orgNode.NodeLastName = node.Last_Name;
            orgNode.Description = node.Title;
            orgNode.ParentNodeID = parseInt(node.Parent) || null;
            if (!orgNode.ParentNodeID || !orgNode.NodeID) {
                if (!orgNode.NodeID) {
                    let date = new Date();
                    orgNode.NodeID = date.getTime();
                }
                this.unmappedNodesCount++;
                orgNode.children = new Array<OrgNodeModel>();
                this.defaultNode = orgNode;
            }
            this.mappedNodesCount++;
        }
        return orgNode;
    }

    private checkFileFormat(headers): boolean {
        let headerString: string = "";
        if (headers) {
            headers.forEach(header => {
                headerString = headerString + header + ",";
            });
            if (DEFAULT_HEADERSTRING === headerString) {
                return true;
            }
        }
        return false;
    }

    private CSV2JSON(csv): boolean {
        this.rootNode = [];
        let array = this.CSVToArray(csv);
        let doesTitleExist: boolean;
        let index: any;
        for (let i = 0; i < array.length; i++) {
            let title = array[i][0];
            if (title === "UID") {
                index = i;
                doesTitleExist = true;
                break;
            } else {
                doesTitleExist = false;
            }
        }

        if (doesTitleExist) {
            if (this.checkFileFormat(array[index])) {
                let objArray = [];
                for (let i = index + 1; i < array.length; i++) {
                    objArray[i] = {};
                    for (let k = 0; k <= array.length; k++) {
                        let key = array[index][k];
                        if (key === "First Name") {
                            key = key.replace(" ", "_");
                        }
                        if (key === "Last Name") {
                            key = key.replace(" ", "_");
                        }
                        objArray[i][key] = array[i][k];
                    }
                }

                objArray.forEach((node) => {
                    if (node.UID !== "") {
                        this.rootNode.push(this.convertBaseModelToData(node));
                    }
                });

                if (this.unmappedNodesCount > 1) {
                    this.hasMultipleParent = true;
                    return false;
                } else {
                    this.hasMultipleParent = false;
                    this.unmappedNodesCount = this.unmappedNodesCount - 1;
                }

                this.json = JSON.stringify(this.rootNode);
                this.json = this.json.replace(/},/g, "},\r\n");
                this.json = JSON.parse(this.json);
                if (this.json && this.json.length === 0) {
                    return false;
                }
                return true;
            }
        }
        return false;
    }
}