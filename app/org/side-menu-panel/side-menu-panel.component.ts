import { Component, Input, Output, OnChanges, SimpleChange, EventEmitter } from "@angular/core";

import { OrgGroupModel, OrgNodeModel, ChartMode, OrgService, UserFeedBack, DomElementHelper} from "../shared/index";
import { UserModel } from "../../Shared/index";

declare let $: any;

const FEEDBACK_ICON_OPEN = `keyboard_arrow_up`;
const FEEDBACK_ICON_CLOSE = `close`;

const MenuElement = {
    exportData: "#exportData",
    publishData: "#publishData"
};

@Component({
    selector: "sg-side-menu-panel",
    templateUrl: "app/org/side-menu-panel/side-menu-panel.component.html",
    styleUrls: ["app/org/side-menu-panel/side-menu-panel.component.css"]
})

export class SideMenuComponent implements OnChanges {
    isCollapsed: boolean;
    selectedNode: OrgNodeModel;
    directReportees: any;
    totalReportees: any;
    depth: any;
    private userModel: UserModel;
    private isFeedbackOpen: boolean;
    private tabs: any;
    private feedbackDescriptionText: any;
    private feedbackIconLabel: any;
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

        this.feedbackIconLabel = "keyboard_arrow_up";
        this.isFeedbackOpen = false;
    }

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
                if (this.feedbackIconLabel === FEEDBACK_ICON_CLOSE) {
                    this.feedbackIconLabel = FEEDBACK_ICON_OPEN;
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
        $("#menuPanel").width("100%");
        $(".sideNav.fixed").width("240px");
        this.domHelper.hideElements(MenuElement.publishData);
        this.domHelper.showElements(MenuElement.exportData);
    }

    closePanel() {
        this.isCollapsed = false;
        if (!this.feedbackDescriptionText && this.isFeedbackOpen) {
            this.openOrCloseFeedBackPanel();
        }
        $("#menuPanel").width("3px");
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

    OnPublish() {
        this.domHelper.hideElements(MenuElement.exportData);
        this.domHelper.showElements(MenuElement.publishData);
    }

    OnExport() {
        this.domHelper.showElements(MenuElement.exportData);
        this.domHelper.hideElements(MenuElement.publishData);

    }

    openOrCloseFeedBackPanel() {
        if (this.feedbackIconLabel === FEEDBACK_ICON_OPEN) {
            this.isFeedbackOpen = true;
            this.feedbackIconLabel = FEEDBACK_ICON_CLOSE;
            $("#feedbackPanel").height("220px");
        } else if (this.feedbackIconLabel === FEEDBACK_ICON_CLOSE) {
            this.feedbackIconLabel = FEEDBACK_ICON_OPEN;
            this.feedbackDescriptionText = "";
            $("#feedbackPanel").height("30px");
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