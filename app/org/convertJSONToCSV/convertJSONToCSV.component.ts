import * as angular from "@angular/core";
import {Component, Input} from "@angular/core";

import { OrgNodeBaseModel, OrgNodeModel } from "../shared/index";

@Component({
    selector: "sg-origami-csv",
    templateUrl: "app/org/convertJSONToCSV/convertJSONToCSV.component.html",
    styleUrls: ["app/org/convertJSONToCSV/convertJSONToCSV.component.css", "app/style.css"]
})

export class ConvertJSONToCSVComponent {
    treeData: any;
    @Input() orgChartData: any;

    onClickConvertToCSVReport() {
        this.treeData = JSON.parse(JSON.stringify(this.orgChartData.OrgNodes));
        let nodeData = this.treeData[0];
        this.JSONToCSVConvertor(nodeData, this.orgChartData.OrganizationName, true);
    }

    private convertDataToBaseModel(node): OrgNodeBaseModel {
        let orgNode = new OrgNodeBaseModel();
        if (node) {
            orgNode.UID = node.NodeID;
            orgNode.First_Name = node.NodeFirstName;
            orgNode.Last_Name = node.NodeLastName;
            orgNode.Title = node.Description;
            orgNode.Parent = node.ParentNodeID;
        }
        return orgNode;
    }

    private JSONToCSVConvertor(jsonData, reportTitle, showLabel) {
        // If JSONData is not an object then JSON.parse will parse the JSON string in an Object       
        let orgData = typeof jsonData !== "object" ? JSON.parse(jsonData) : jsonData;
        let orgNode = this.convertDataToBaseModel(orgData);
        let CSV = "";

        // Set Report title in first row or line
        CSV += reportTitle + "\r\n\n";
        CSV += "Organization ID: " + orgData.OrgID + "\r\n\n";

        // This condition will generate the Label/Header
        if (showLabel) {
            let row = this.getCSVFileHeaders(orgNode);

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

        this.downloadCSVFile(fileName, CSV);
    }

    private extractRowForCSVData(orgNode): any {
        // 1st loop is to extract each row
        let CSV = "";
        let orgChild = this.convertDataToBaseModel(orgNode);
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


    private onClickDownloadTemplate() {
        // If JSONData is not an object then JSON.parse will parse the JSON string in an Object       
        let orgNode = new OrgNodeBaseModel();
        let node = this.convertDataToBaseModel(orgNode);
        let CSV = "";

        if (node) {
            let row = this.getCSVFileHeaders(node);

            // append Label row with line break
            CSV += row + "\r\n";
        }

        this.downloadCSVFile("DownloadTemplate", CSV);
    }

    private getCSVFileHeaders(orgNode) {
        let row = "";

        // This loop will extract the label from 1st index of on array
        for (let index in orgNode) {
            if (index === "First_Name") {
                index = index.replace("_", " ");
            }
            if (index === "Last_Name") {
                index = index.replace("_", " ");
            }
            // Now convert each value to string and comma-seprated
            row += index + ",";
        }

        row = row.slice(0, -1);
        return row;
    }

    private downloadCSVFile(fileName, CSV) {
        // Initialize file format you want csv or xls
        let uri = "data:text/csv;charset=utf-8," + encodeURI(CSV);

        // Now the little tricky part.
        // you can use either>> window.open(uri);
        // but this will not work in some browsers
        // or you will not get the correct file extension    

        // this trick will generate a temp <a /> tag
        let link: HTMLAnchorElement = document.createElement("a");
        link.href = uri;
        link.setAttribute("download", fileName + ".csv");
        // set the visibility hidden so it will not effect on your web-layout
        link.style.visibility = "hidden";

        // this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

}