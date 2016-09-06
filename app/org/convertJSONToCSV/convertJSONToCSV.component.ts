import * as angular from "@angular/core";
import {Component, Input} from "@angular/core";

import { DataHelperJSONToCSV } from "../data-helper-jsontocsv/data-helper-jsontocsv";

@Component({
    selector: "sg-origami-csv",
    templateUrl: "app/org/convertJSONToCSV/convertJSONToCSV.component.html",
    styleUrls: ["app/org/convertJSONToCSV/convertJSONToCSV.component.css", "app/style.css"],
    providers: [DataHelperJSONToCSV]
})

export class ConvertJSONToCSVComponent {
    @Input() orgChartData: any;
    @Input() orgName: any;

    constructor(private dataHelperForJSONToCSV: DataHelperJSONToCSV) {
    }

    onClickConvertToCSVReport() {
        this.JSONToCSVConvertor(this.orgChartData.OrgNodes[0], this.orgName, true);
    }

    private JSONToCSVConvertor(jsonData, reportTitle, showLabel) {
        // If JSONData is not an object then JSON.parse will parse the JSON string in an Object       
        let orgData = typeof jsonData !== "object" ? JSON.parse(jsonData) : jsonData;
        let orgNode = this.dataHelperForJSONToCSV.convertDataToBaseModel(orgData);
        let CSV = "";

        // Set Report title in first row or line
        CSV += reportTitle + "\r\n\n";
        CSV += "Organization ID: " + this.orgChartData.CompanyID + "\r\n\n";

        // This condition will generate the Label/Header
        if (showLabel) {
            let row = this.dataHelperForJSONToCSV.getCSVFileHeaders(orgNode);

            // append Label row with line break
            CSV += row + "\r\n";
        }

        if (orgData) {
            CSV += this.extractRowForCSVData(orgData);
        }

        if (CSV === "") {
            alert("Invalid data");
            return;
        }

        // Generate a file name
        let fileName = "CSVData_";
        // this will remove the blank-spaces from the title and replace it with an underscore
        fileName += reportTitle.replace(/ /g, "_");

        this.dataHelperForJSONToCSV.downloadCSVFile(fileName, CSV);
    }

    private extractRowForCSVData(orgNode): any {
        // 1st loop is to extract each row
        let CSV = "";
        let orgChild = this.dataHelperForJSONToCSV.convertDataToBaseModel(orgNode);
        if (orgChild) {
            for (let i = 0; i < 1 /*arrData.length*/; i++) {
                let row = "";

                // 2nd loop will extract each column and convert it in string comma-seprated
                for (let index in orgChild) {
                    row += orgChild[index] + ",";
                }

                row.slice(0, row.length - 1);

                // add a line break after each row
                CSV += row + "\r\n";
            }
        }

        if (orgNode.children || orgNode._children) {
            let nodeChildren = orgNode.children || orgNode._children;
            nodeChildren.forEach(element => {
                CSV += this.extractRowForCSVData(element);
            });
        }

        return CSV;
    }

}