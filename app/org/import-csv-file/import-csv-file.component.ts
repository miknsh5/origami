import { Component, Input, Output, EventEmitter } from "@angular/core";

import { OrgGroupModel, OrgNodeModel, OrgService } from "../shared/index";

declare let $: any;

@Component({
    selector: "sg-org-import-csv-file",
    templateUrl: "app/org/import-csv-file/import-csv-file.component.html",
    styleUrls: ["app/org/import-csv-file/import-csv-file.component.css", "app/style.css", "app/org/menu-panel/menu-panel.component.css"]
})

export class ImportCsvFileComponent {
    private fileName: any;
    private json: any;
    private rootNode = [];
    private nodeName: any;
    private mappedNodesCount: any;
    private unmappedNodesCount: any;
    private $importfile: any;
    private $loadScreen: any;
    private $confirmImport: any;

    @Input() selectedGroup: OrgGroupModel;
    @Output() newOrgNodes = new EventEmitter<OrgNodeModel>();

    constructor(private orgService: OrgService) {
        this.fileName = "";
        this.mappedNodesCount = 0;
        this.unmappedNodesCount = 0;
        this.$importfile = "#importFile";
        this.$loadScreen = "#loadScreen";
        this.$confirmImport = "#confirmImport";
    }

    private onImport(event) {
        $(this.$importfile).hide();
        $(this.$loadScreen).show();
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
                $(this.$loadScreen).hide();
                $(this.$confirmImport).show();
            };
            reader.onerror = function () {
                alert("Unable to read " + file.fileName);
            };
        }
    }

    onConfirm() {
        this.orgService.addGroupNodes(this.selectedGroup.OrgGroupID, this.json)
            .subscribe(data => this.setOrgGroupData(data),
            err => this.orgService.logError(err));
        $(this.$confirmImport).hide();
        $("#groupSettings").hide();
        this.nodeName = " ";
        this.unmappedNodesCount = 0;
        this.mappedNodesCount = 0;
    }

    private setOrgGroupData(data) {
        this.newOrgNodes.emit(data);
    }

    private onCancelImport() {
        $(this.$importfile).show();
        $(this.$loadScreen).hide();
        $(this.$confirmImport).hide();
        this.nodeName = " ";
        this.unmappedNodesCount = 0;
        this.mappedNodesCount = 0;
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

    private CSV2JSON(csv) {
        let array = this.CSVToArray(csv, ",");
        let objArray = [];
        for (let i = 1; i < array.length; i++) {
            objArray[i - 1] = {};
            for (let k = 0; k <= array.length; k++) {
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
        if (this.unmappedNodesCount >= 1) {
            this.unmappedNodesCount = this.unmappedNodesCount - 1;
        }
        this.json = JSON.stringify(this.rootNode);
        this.json = this.json.replace(/},/g, "},\r\n");
        this.json = JSON.parse(this.json);
    }
}
