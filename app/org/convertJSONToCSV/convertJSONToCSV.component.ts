import * as angular from "@angular/core";
import {Component, Input} from "@angular/core";

import { OrgNodeBaseModel, OrgNodeModel } from "../shared/index";

@Component({
    selector: "sg-origami-CSV-reports",
    templateUrl: "app/org/convertJSONToCSV/convertJSONToCSV.component.html",
    styleUrls: ["app/org/convertJSONToCSV/convertJSONToCSV.component.css", "app/style.css"]
})

export class ConvertJSONToCSV {
    treeData: any;

    @Input() orgChartData: any;

    onClickConvertToCSVReport() {
        this.treeData = JSON.parse(JSON.stringify(this.orgChartData.OrgNodes));
        let nodeData = this.treeData[0];
        this.JSONToCSVConvertor(nodeData, this.orgChartData.OrganizationName, true);
    }

    private convertDataToBaseModel(arrData): OrgNodeBaseModel {
        let node = new OrgNodeBaseModel();
        if (arrData) {
            // node.OrgID = arrData.OrgID;
            node.UID = arrData.NodeID;
            node.First_Name = arrData.NodeFirstName;
            node.Last_Name = arrData.NodeLastName;
            node.Title = arrData.Description;
            node.Parent = arrData.ParentNodeID;
        }
        return node;
    }

    private JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
        //If JSONData is not an object then JSON.parse will parse the JSON string in an Object       
        let arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        console.log(arrData);

        let node = this.convertDataToBaseModel(arrData);

        let CSV = '';
        //Set Report title in first row or line

        CSV += ReportTitle + '\r\n\n';

        CSV += "Organization ID: " + arrData.OrgID + '\r\n\n';

        //This condition will generate the Label/Header
        if (ShowLabel) {
            let row = "";

            //This loop will extract the label from 1st index of on array
            for (let index in node) {
                if (index === "First_Name") {
                    index = index.replace("_", " ");
                }
                if (index === "Last_Name") {
                    index = index.replace("_", " ");
                }
                //Now convert each value to string and comma-seprated
                row += index + ',';
            }

            row = row.slice(0, -1);

            //append Label row with line break
            CSV += row + '\r\n';
        }

        if (arrData) {
            CSV += this.extractRowForCSVData(arrData);
        }

        if (CSV == '') {
            alert("Invalid data");
            return;
        }

        //Generate a file name
        let fileName = "CSVData_";
        //this will remove the blank-spaces from the title and replace it with an underscore
        fileName += ReportTitle.replace(/ /g, "_");

        //Initialize file format you want csv or xls
        let uri = 'data:text/csv;charset=utf-8,' + encodeURI(CSV);

        // Now the little tricky part.
        // you can use either>> window.open(uri);
        // but this will not work in some browsers
        // or you will not get the correct file extension    

        //this trick will generate a temp <a /> tag
        let link: HTMLAnchorElement = document.createElement("a");
        link.href = uri;
        link.setAttribute("download", fileName + ".csv");
        //set the visibility hidden so it will not effect on your web-layout
        //link.style = "visibility:hidden";


        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    private extractRowForCSVData(node): any {
        //1st loop is to extract each row
        let CSV = "";
        let child = this.convertDataToBaseModel(node);
        if (child) {
            for (let i = 0; i < 1 /*arrData.length*/; i++) {
                let row = "";

                //2nd loop will extract each column and convert it in string comma-seprated
                for (let index in child) {
                    row += '"' + child[index] + '",';
                }

                row.slice(0, row.length - 1);

                //add a line break after each row
                CSV += row + '\r\n';
            }

        }

        if (node.children || node._children) {
            let nodeChildren = node.children || node._children;
            nodeChildren.forEach(element => {
                CSV += this.extractRowForCSVData(element);
            });
        }

        return CSV;
    }

}