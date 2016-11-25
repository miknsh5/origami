import { Component, HostListener, Input, Output, OnChanges, SimpleChange, EventEmitter, ViewChild } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";
import { OrgGroupModel, OrgNodeModel, ChartMode, OrgService, UserFeedBack, DomElementHelper } from "../shared/index";
import { UserModel } from "../../Shared/index";

declare let jQuery: any;

const FEEDBACK_ICON_OPEN = `keyboard_arrow_up`;
const FEEDBACK_ICON_CLOSE = `close`;
const EDIT_ICON = `create`;
const DELETE_ICON = `delete`;
const SAVE_ICON = `save`;
const CLOSE_ICON = `close`;

const MenuElement = {
    sidePanelExportData: "#sidePanelExportData",
    publishData: "#publishData",
    menuPanel: "#menuPanel",
    sideNavfixed: ".sideNav.fixed",
    feedbackPanel: "#feedbackPanel",
    deleteNodeModal: "#deleteNodeModal",
    deleteNodeConfirm: "#deleteNodeConfirm",
    deleteChildNodeConfirm: "#deleteChildNodeConfirm"
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
    isEditModeEnabled: boolean;
    editOrSave: any;
    deleteOrClose: any;

    private editNodeDetails: OrgNodeModel;
    private userModel: UserModel;
    private isFeedbackOpen: boolean;
    private feedbackDescriptionText: any;
    private feedbackIcon: any;
    private feedback: UserFeedBack;
    private isEditOrDeleteDisabled: boolean;

    @ViewChild("firstName") firstName;
    @ViewChild("lastName") lastName;
    @ViewChild("description") description;

    @Input() currentMode: ChartMode;
    @Input() orgChart: OrgGroupModel;
    @Input() companyName: string;
    @Input() selectedOrgNode: OrgNodeModel;
    @Input() svgWidth: any;
    @Input() svgHeight: any;
    @Input() isMenuSettingsEnabled: boolean;
    @Input() isSmartBarAddEnabled: boolean;

    @Output() updateNode = new EventEmitter<OrgNodeModel>();
    @Output() deleteNode = new EventEmitter<OrgNodeModel>();
    @Output() showFirstNameLabel = new EventEmitter<boolean>();
    @Output() showLastNameLabel = new EventEmitter<boolean>();
    @Output() showDescriptionLabel = new EventEmitter<boolean>();
    @Output() isEditEnabled = new EventEmitter<boolean>();
    @Output() deleteTitle: string;
    @Output() name: string;

    @HostListener("window:keydown", ["$event"])
    onKeyDown(event: any) {
        event.stopPropagation();
        if (!this.isMenuSettingsEnabled) {
            if ((event as KeyboardEvent).keyCode === 27) {
                if (this.isEditModeEnabled) {
                    this.deleteOrClose = CLOSE_ICON;
                    this.onDeleteOrCancelNodeClicked();
                }
            }
        }
    }

    @HostListener("window:click", ["$event"])
    onClick(event: any) {
        if (!this.isMenuSettingsEnabled) {
            event.stopPropagation();
            if (event.target.nodeName === "svg") {
                if (this.firstName && this.lastName && this.description) {
                    if (this.firstName.value) {
                        this.editOrSave = SAVE_ICON;
                        this.onEditOrSaveNodeClicked();
                    } else {
                        this.deleteOrClose = CLOSE_ICON;
                        this.onDeleteOrCancelNodeClicked();
                        let node: any = this.selectedOrgNode;
                        if (node.parent || this.firstName.value === "") {
                            alert("Please enter FirstName.");
                        }
                    }
                }
            }
        }
    }

    constructor(private orgService: OrgService, private domHelper: DomElementHelper) {
        this.feedbackIcon = FEEDBACK_ICON_OPEN;
        this.isFeedbackOpen = false;
        this.isClosed = false;
        this.isEditModeEnabled = false;
        this.editOrSave = EDIT_ICON;
        this.deleteOrClose = DELETE_ICON;
        this.isEditOrDeleteDisabled = false;
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["orgChart"]) {
            if (this.orgChart) {
                this.isClosed = false;
                this.openPanel();
            } else {
                this.isClosed = true;
                this.closePanel();
            }
        }

        if (changes["isSmartBarAddEnabled"] && !changes["isSmartBarAddEnabled"].currentValue && this.isCollapsed) {
            this.openPanel();
            this.isCollapsed = false;
        }

        if (changes["selectedOrgNode"]) {
            if (changes["isSmartBarAddEnabled"] && !changes["isSmartBarAddEnabled"].currentValue && this.isCollapsed) {
                this.openPanel();
                this.isCollapsed = false;
            }
            if (this.isEditModeEnabled && this.selectedNode.NodeID !== this.selectedOrgNode.NodeID) {
                this.deleteOrClose = CLOSE_ICON;
                this.onDeleteOrCancelNodeClicked();
            }
            if (this.selectedOrgNode) {
                if (this.selectedOrgNode.NodeID === -1) {
                    this.isEditOrDeleteDisabled = true;
                    this.closePanel();
                    this.isCollapsed = true;
                } else if (this.isCollapsed || !this.isClosed) {
                    this.isEditOrDeleteDisabled = false;
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
            } else if (this.isCollapsed) {
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
        if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1 && !this.isSmartBarAddEnabled) {
            this.isCollapsed = true;
            this.isClosed = false;
            this.domHelper.setWidth(MenuElement.menuPanel, "100%");
            this.domHelper.setWidth(MenuElement.sideNavfixed, "100%");
            this.domHelper.hideElements(MenuElement.publishData);
            this.domHelper.showElements(MenuElement.sidePanelExportData);
        }
    }

    closePanel() {
        this.isCollapsed = false;
        this.isClosed = true;
        if (!this.feedbackDescriptionText && this.isFeedbackOpen) {
            this.openOrCloseFeedBackPanel();
        }
        this.domHelper.setWidth(MenuElement.menuPanel, "3px");
        this.domHelper.setWidth(MenuElement.sideNavfixed, 0);
        if (this.isEditModeEnabled) {
            this.deleteOrClose = CLOSE_ICON;
            this.onDeleteOrCancelNodeClicked();
        }
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
        this.domHelper.hideElements(MenuElement.sidePanelExportData);
        this.domHelper.showElements(MenuElement.publishData);
    }

    OnExport() {
        this.domHelper.showElements(MenuElement.sidePanelExportData);
        this.domHelper.hideElements(MenuElement.publishData);
    }

    onNodeDeleteConfirm(data: boolean) {
        if (this.selectedNode.NodeID === -1) {
            this.deleteNode.emit(this.selectedNode);
        } else {
            if (this.selectedNode.children && this.selectedNode.children.length > 0) {
                this.domHelper.hideElements(MenuElement.deleteNodeConfirm);
                this.domHelper.showElements(MenuElement.deleteChildNodeConfirm);
            } else {
                this.orgService.deleteNode(this.selectedNode.NodeID)
                    .subscribe(data => this.emitDeleteNodeNotification(data),
                    error => this.handleError(error),
                    () => console.log("Deleted node."));
            }
        }
    }
    onNodeDeleteCancel(data: boolean) {
        this.deleteTitle = "";
        this.name = "";
        this.domHelper.hideElements([MenuElement.deleteNodeModal, MenuElement.deleteChildNodeConfirm, MenuElement.deleteNodeConfirm]);
    }
    dismissPopup() {
        this.deleteTitle = "";
        this.name = "";
        this.domHelper.hideElements([MenuElement.deleteNodeModal, MenuElement.deleteChildNodeConfirm, MenuElement.deleteNodeConfirm]);
    }

    onDeleteOrCancelNodeClicked() {
        if (this.selectedNode.NodeID !== -1) {
            if (this.deleteOrClose === DELETE_ICON) {
                this.deleteTitle = "Node";
                this.name = this.selectedOrgNode.NodeFirstName + " " + this.selectedOrgNode.NodeLastName;
                this.domHelper.showElements([MenuElement.deleteNodeModal, MenuElement.deleteNodeConfirm]);
            } else if (this.deleteOrClose === CLOSE_ICON) {
                this.editOrSave = EDIT_ICON;
                this.deleteOrClose = DELETE_ICON;
                this.isEditModeEnabled = false;
                this.selectedNode.NodeFirstName = this.editNodeDetails.NodeFirstName;
                this.selectedNode.NodeLastName = this.editNodeDetails.NodeLastName;
                this.selectedNode.Description = this.editNodeDetails.Description;
                this.editNodeDetails = null;
                this.isEditEnabled.emit(false);
            }
        }

    }
    private emitDeleteNodeNotification(data) {
        if (data === true) {
            this.deleteNode.emit(this.selectedNode);
            this.domHelper.hideElements([MenuElement.deleteNodeModal, MenuElement.deleteChildNodeConfirm, MenuElement.deleteNodeConfirm]);
        }
    }

    private isNullOrEmpty(value: string) {
        if (value && value.trim().length > 0) {
            return false;
        }
        return true;
    }

    onEditOrSaveNodeClicked() {
        if (this.selectedNode.NodeID !== -1) {
            if (this.editOrSave === EDIT_ICON) {
                this.isEditEnabled.emit(true);
                this.isEditModeEnabled = true;
                this.editOrSave = SAVE_ICON;
                this.deleteOrClose = CLOSE_ICON;
                this.editNodeDetails = new OrgNodeModel();
                this.editNodeDetails.NodeFirstName = this.selectedNode.NodeFirstName;
                this.editNodeDetails.NodeLastName = this.selectedNode.NodeLastName;
                this.editNodeDetails.Description = this.selectedNode.Description;
            } else if (this.editOrSave === SAVE_ICON) {
                if (!this.isNullOrEmpty(this.firstName.value)) {
                    //    this.isFormSubmitted = true;
                    this.editNodeDetails = new OrgNodeModel();
                    this.editNodeDetails.NodeFirstName = (this.firstName.value).trim();
                    this.editNodeDetails.NodeLastName = (this.lastName.value).trim();
                    this.editNodeDetails.Description = (this.description.value).trim();
                    this.editNodeDetails.children = this.selectedNode.children;
                    this.editNodeDetails.NodeID = this.selectedNode.NodeID;
                    this.editNodeDetails.OrgGroupID = this.selectedNode.OrgGroupID;
                    this.editNodeDetails.CompanyID = this.selectedNode.CompanyID;
                    this.editNodeDetails.ParentNodeID = this.selectedNode.ParentNodeID;
                    this.editNode(this.editNodeDetails);
                    this.isEditModeEnabled = false;
                    this.editOrSave = EDIT_ICON;
                    this.deleteOrClose = DELETE_ICON;
                } else {
                    alert("Please enter FirstName.");
                }
            }
        }
    }

    private editNode(node: OrgNodeModel) {
        if (!node) { return; }
        // we don"t really need to send any child info to the server at this point
        node.children = null;
        this.orgService.updateNode(node)
            .subscribe(data => this.emitUpdateNodeNotification(data),
            error => this.handleError(error),
            () => console.log("Updated node."));
    }

    private emitUpdateNodeNotification(data) {
        if (data === true) {
            this.updateNode.emit(this.editNodeDetails);
            this.editNodeDetails = null;
            this.isEditEnabled.emit(false);
        }
    }

    private onInputKeyDownOrUp(event: KeyboardEvent, ngControl: NgControl) {
        if (this.selectedNode) {
            let target = (<HTMLInputElement>event.target);
            let node = new OrgNodeModel();
            node.OrgGroupID = this.selectedNode.OrgGroupID;
            node.CompanyID = this.selectedNode.CompanyID;
            node.ParentNodeID = this.selectedNode.ParentNodeID;
            node.NodeID = this.selectedNode.NodeID;
            node.IsStaging = this.selectedNode.IsStaging;
            node.Description = this.selectedNode.Description;
            node.IsFakeRoot = this.selectedNode.IsFakeRoot;
            node.IsNewRoot = this.selectedNode.IsNewRoot;
            node.children = this.selectedNode.children;

            if (ngControl.name === "firstName") {
                this.selectedNode.NodeFirstName = node.NodeFirstName = ngControl.value;
                node.NodeLastName = this.selectedNode.NodeLastName;
                node.Description = this.selectedNode.Description;
            } else if (ngControl.name === "lastName") {
                node.NodeFirstName = this.selectedNode.NodeFirstName;
                this.selectedNode.NodeLastName = node.NodeLastName = ngControl.value;
                node.Description = this.selectedNode.Description;
            }
            else if (ngControl.name === "description") {
                node.NodeFirstName = this.selectedNode.NodeFirstName;
                node.NodeLastName = this.selectedNode.NodeLastName;
                this.selectedNode.Description = node.Description = ngControl.value;
            }

            if (node.IsStaging && node.NodeID === -1) {
                if (this.selectedNode.NodeFirstName || this.selectedNode.NodeLastName || this.selectedNode.Description) {
                    this.selectedNode.IsStaging = node.IsStaging = false;
                }
            } else {
                if (node.NodeID !== -1) {
                    node.IsStaging = true;
                }
                this.updateNode.emit(node);
            }
        }
    }

    openOrCloseFeedBackPanel() {
        if (this.feedbackIcon === FEEDBACK_ICON_OPEN) {
            this.isFeedbackOpen = true;
            this.feedbackIcon = FEEDBACK_ICON_CLOSE;
            this.domHelper.setHeight(MenuElement.feedbackPanel, "220px");
            document.querySelector("textarea").focus();
        } else if (this.feedbackIcon === FEEDBACK_ICON_CLOSE) {
            this.feedbackIcon = FEEDBACK_ICON_OPEN;
            this.feedbackDescriptionText = "";
            this.domHelper.setHeight(MenuElement.feedbackPanel, 0);
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

            this.orgService.sendFeedback(this.feedback)
                .subscribe(data => { this.feedbackDescriptionText = ""; },
                err => this.orgService.logError(err));
        }
    }

    private handleError(err) {
        try {
            let errorMessage = JSON.parse(err._body);
            alert(errorMessage.Message);
        } catch (ex) {
            alert("OOPs!! Something went wrong!! ");
        }
        console.log(err);
        this.editNodeDetails = null;
    }
}