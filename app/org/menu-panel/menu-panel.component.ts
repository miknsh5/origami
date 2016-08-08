import { Component, Input, Output, OnChanges, SimpleChange, } from "@angular/core";

import { OrgNodeModel } from "../shared/index";

@Component({
    selector: "sg-org-menu-panel",
    templateUrl: "app/org/menu-panel/menu-panel.component.html",
    styleUrls: ["app/org/menu-panel/menu-panel.component.css", "app/style.css"]
})

export class MenuPanelComponent implements OnChanges {
    isOpen: boolean = false;
    selectedNode: OrgNodeModel;

    @Input() selectedOrgNode: OrgNodeModel;

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["selectedOrgNode"]) {
            if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1) {
                this.selectedNode = this.selectedOrgNode;
            }
        }
    }
    openPanel() {
        if (this.selectedOrgNode) {
            this.isOpen = true;
            document.getElementById("menuPanel").style.width = "250px";
        }
    }
    closePanel() {
        this.isOpen = false;
        document.getElementById("menuPanel").style.width = "5px";
    }
}