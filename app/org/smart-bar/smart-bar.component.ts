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
    treedata: OrgSearchModel[];

    @Input() treeJson: any;

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["treeJson"]) {
            if (this.treeJson) {
                this.treedata = new Array<OrgSearchModel>();
                this.treeJson.forEach((element: OrgNodeModel, index) => {
                    let data = new OrgSearchModel();
                    data.NodeId = element.NodeID;
                    data.NodeName = element.NodeFirstName + element.NodeLastName;
                    data.NodeTitle = element.Description;
                    this.treedata[index] = (data);
                    if (element.children) {
                        element.children.forEach((child: OrgNodeModel, i) => {
                            let childData = new OrgSearchModel();
                            childData.NodeId = child.NodeID;
                            childData.NodeName = child.NodeFirstName + child.NodeLastName;
                            childData.NodeTitle = child.Description;
                            this.treedata[i + index] = (childData);
                        });
                    }
                });
            }
        }
    }
    private onInputName() {
        if (this.searchOrAdd) {
            this.isTyping = true;
        } else {
            this.isTyping = false;
        }

    }

}