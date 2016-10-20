import { Component, Input, Output, OnChanges, SimpleChange, EventEmitter } from "@angular/core";

import { OrgGroupModel, OrgNodeModel, ChartMode, OrgService, UserFeedBack, DomElementHelper } from "../shared/index";
import { UserModel } from "../../Shared/index";

declare let $: any;

const FEEDBACK_ICON_OPEN = `keyboard_arrow_up`;
const FEEDBACK_ICON_CLOSE = `close`;

const MenuElement = {
    exportData: "#exportData",
    publishData: "#publishData",
    menuPanel: "#menuPanel",
    sideNavfixed: ".sideNav.fixed",
    feedbackPanel: "#feedbackPanel"
};

@Component({
    selector: "sg-side-menu-panel",
    templateUrl: "app/org/side-menu-panel/side-menu-panel.component.html",
    styleUrls: ["app/org/side-menu-panel/side-menu-panel.component.css"]
})

export class SideMenuComponent implements OnChanges {
    isCollapsed: boolean;
    isClosed: boolean;
    selectedNode: OrgNodeModel;
    directReportees: any;
    totalReportees: any;
    depth: any;
    private userModel: UserModel;
    private isFeedbackOpen: boolean;
    private feedbackDescriptionText: any;
    private feedbackIcon: any;
    private feedback: UserFeedBack;

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

    constructor(private orgSevice: OrgService, private domHelper: DomElementHelper) {

        this.feedbackIcon = FEEDBACK_ICON_OPEN;
        this.isFeedbackOpen = false;
        this.isClosed = false;
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["orgChart"]) {
            this.isClosed = false;
            this.openPanel();
        }
        if (changes["isAddOrEditModeEnabled"] && !changes["isAddOrEditModeEnabled"].currentValue) {
            this.isClosed = false;
            this.openPanel();
        }

        if (changes["selectedOrgNode"]) {
            if (this.selectedOrgNode) {
                if (this.selectedOrgNode && this.selectedOrgNode.NodeID === -1) {
                    this.closePanel();
                } else if (!this.isClosed && this.selectedOrgNode.NodeID !== -1) {
                    this.openPanel();
                }
                if (this.isCollapsed && this.selectedOrgNode.NodeID !== -1) {
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
                if (this.feedbackIcon === FEEDBACK_ICON_CLOSE) {
                    this.feedbackIcon = FEEDBACK_ICON_OPEN;
                }
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
        this.isClosed = false;
        this.domHelper.setElementWidth(MenuElement.menuPanel, "100%");
        this.domHelper.setElementWidth(MenuElement.sideNavfixed, "100%");
        this.domHelper.hideElements(MenuElement.publishData);
        this.domHelper.showElements(MenuElement.exportData);
    }

    closePanel() {
        this.isCollapsed = false;
        this.isClosed = true;
        if (!this.feedbackDescriptionText && this.isFeedbackOpen) {
            this.openOrCloseFeedBackPanel();
        }
        this.domHelper.setElementWidth(MenuElement.menuPanel, "3px");
        this.domHelper.setElementWidth(MenuElement.sideNavfixed, 0);
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
        this.domHelper.initTabControl();
    }

    OnPublish() {
        this.domHelper.hideElements(MenuElement.exportData);
        this.domHelper.showElements(MenuElement.publishData);
    }

    OnExport() {
        this.domHelper.showElements(MenuElement.exportData);
        this.domHelper.hideElements(MenuElement.publishData);
    }

    openOrCloseFeedBackPanel() {
        if (this.feedbackIcon === FEEDBACK_ICON_OPEN) {
            this.isFeedbackOpen = true;
            this.feedbackIcon = FEEDBACK_ICON_CLOSE;
            this.domHelper.setElementHeight(MenuElement.feedbackPanel, "220px");
        } else if (this.feedbackIcon === FEEDBACK_ICON_CLOSE) {
            this.feedbackIcon = FEEDBACK_ICON_OPEN;
            this.feedbackDescriptionText = "";
            this.domHelper.setElementHeight(MenuElement.feedbackPanel, 0);
            this.isFeedbackOpen = false;
        }
    }
    private onFeedbackSend() {
        if (this.feedbackDescriptionText) {
            this.feedback = new UserFeedBack();
            let profile = localStorage.getItem("profile");
            if (profile) {
                this.userModel = JSON.parse(profile);
                this.feedback.UserEmailID = this.userModel.Email;
                this.feedback.UserID = this.userModel.UserID;
                this.feedback.UserName = this.userModel.Name;
            }
            this.feedback.Description = this.feedbackDescriptionText;

            this.orgSevice.sendFeedback(this.feedback)
                .subscribe(data => { this.feedbackDescriptionText = ""; },
                err => this.orgSevice.logError(err));
        }
    }
}