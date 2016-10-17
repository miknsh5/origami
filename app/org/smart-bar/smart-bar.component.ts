import { Component, HostListener, Input, Output, EventEmitter, OnChanges, SimpleChange, AfterContentChecked, ElementRef, Renderer, ViewChild } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";

import { OrgNodeModel, OrgSearchModel, OrgService } from "../shared/index";

@Component({
    selector: "sg-org-smart-bar",
    templateUrl: "app/org/smart-bar/smart-bar.component.html",
    styleUrls: ["app/org/smart-bar/smart-bar.component.css"]
})

export class SamrtBarComponent implements OnChanges {
    isTyping: boolean;
    searchOrAdd: any;
    orgSearchData: OrgSearchModel[];

    @Input() treeJson: any;

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["treeJson"]) {
            if (this.treeJson) {
                this.orgSearchData = new Array<any>();
                this.convertToFlatData(this.treeJson);
                console.log(this.orgSearchData);
            }
        }
    }

    convertToFlatData(inputArray, ischild?: boolean) {
        ischild = ischild || false;
        let index = 0, length = inputArray.length;
        for (index = 0; index < length; index++) {
            let searchModel = new OrgSearchModel();
            searchModel.NodeID = inputArray[index].NodeID;
            searchModel.Title = inputArray[index].Description;
            searchModel.Name = inputArray[index].NodeFirstName + " " + inputArray[index].NodeLastName;

            this.orgSearchData.push(searchModel);

            if (inputArray[index].children && typeof inputArray[index].children === typeof []) {
                this.convertToFlatData(inputArray[index].children, true);
            }
        }
        if (ischild === false) {
            return;
        }
    };

    private onInputName() {
        if (this.searchOrAdd) {
            this.isTyping = true;
        } else {
            this.isTyping = false;
        }
    }
}