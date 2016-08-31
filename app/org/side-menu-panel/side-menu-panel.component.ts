import { Component, Input, Output, OnChanges, SimpleChange, EventEmitter } from "@angular/core";

import { OrgGroupModel, OrgNodeModel, ChartMode} from "../shared/index";

import { ConvertJSONToCSVComponent } from "../convertJSONToCSV/index";
import { ConvertTreeToPNGComponent } from "../convertTreeToPNG/index";

declare let $: any;

@Component({
    selector: "sg-side-menu-panel",
    templateUrl: "app/org/side-menu-panel/side-menu-panel.component.html",
    styleUrls: ["app/org/side-menu-panel/side-menu-panel.component.css", "app/style.css"],
    directives: [ConvertJSONToCSVComponent, ConvertTreeToPNGComponent],
})

export class SideMenuComponent implements OnChanges {
    isCollapsed: boolean;
    selectedNode: OrgNodeModel;
    directReportees: any;
    totalReportees: any;
    depth: any;
    private tabs: any;

    @Input() currentMode: ChartMode;
    @Input() orgChart: OrgGroupModel;
    @Input() companyName: string;
    @Input() selectedOrgNode: OrgNodeModel;
    @Input() isAddOrEditModeEnabled: boolean;
    @Input() svgWidth: any;
    @Input() svgHeight: any;

    @Output() showFirstNameLabel = new EventEmitter<boolean>();
    @Output() showLastNameLabel = new EventEmitter<boolean>();
    @Output() showDescriptionLabel = new EventEmitter<boolean>();

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["selectedOrgNode"]) {
            if (this.selectedOrgNode) {
                if (this.isCollapsed) {
                    this.openPanel();
                }
                this.selectedNode = this.selectedOrgNode;
                this.depth = new Array();
                this.childCount(0, this.selectedNode);
                if (this.depth) {
                    this.directReportees = this.depth[0] || 0;
                    this.totalReportees = 0;
                    this.depth.forEach((d) => {
                        this.totalReportees += d;
                    });
                }
            } else if (!this.selectedOrgNode && this.isCollapsed) {
                this.closePanel();
                this.isCollapsed = true;
            }
        }

        if (this.currentMode === ChartMode.report) {
            this.enableTabControl();
        }
    }

    openPanel() {
        this.isCollapsed = true;
        $("#menuPanel").width("100%");
        $(".sideNav.fixed").width("240px");
    }

    closePanel() {
        this.isCollapsed = false;
        $("#menuPanel").width("2%");
        $(".sideNav.fixed").width("0px");
    }

    private childCount(level, node) {
        if (node) {
            let children: any = node.children || node._children;
            if (children && children.length > 0) {
                if (this.depth.length <= level)
                    this.depth.push(0);

                this.depth[level] += children.length;
                children.forEach((d) => {
                    this.childCount(level + 1, d);
                });
            }
        }
    }

    private setLabelVisiblity(event) {
        if (event.target.id === "FirstName") {
            if (event.target.checked === true) {
                this.showFirstNameLabel.emit(true);
            }
            else {
                this.showFirstNameLabel.emit(false);
            }
        }
        else if (event.target.id === "LastName") {
            if (event.target.checked === true) {
                this.showLastNameLabel.emit(true);
            }
            else {
                this.showLastNameLabel.emit(false);
            }
        }
        else if (event.target.id === "JobTitle") {
            if (event.target.checked === true) {
                this.showDescriptionLabel.emit(true);
            }
            else {
                this.showDescriptionLabel.emit(false);
            }
        }
    }

    private enableTabControl() {
        setTimeout(() => {
            if (!this.tabs) {
                this.tabs = $("ul.tabs").tabs();
            }
        }, 500);
    }

}