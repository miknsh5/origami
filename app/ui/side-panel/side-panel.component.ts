import { Component, HostListener, Input, Output, OnChanges, SimpleChange, EventEmitter, OnInit, ViewChild } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";

import {
    UserModel, OrgGroupModel, OrgNodeModel, ChartMode, OrgService, UserFeedBack, DOMHelper, TutorialMode
} from "../../shared/index";

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
    deleteChildNodeConfirm: "#deleteChildNodeConfirm",
    sendFeedback: "#sendFeedback"
};

@Component({
    selector: "side-panel",
    templateUrl: "app/ui/side-panel/side-panel.component.html",
    styleUrls: ["app/ui/side-panel/side-panel.component.css"]
})

export class SidePanelComponent implements OnInit, OnChanges {
    isCollapsed: boolean;
    isClosed: boolean;
    selectedNode: OrgNodeModel;
    directReportees: any;
    totalReportees: any;
    depth: any;
    isEditModeEnabled: boolean;
    editOrSave: any;
    deleteOrClose: any;
    verticalSlider: any;
    horizontalSlider: any;

    private editNodeDetails: OrgNodeModel;
    private userModel: UserModel;
    private isFeedbackOpen: boolean;
    private feedbackDescriptionText: any;
    private feedbackIcon: any;
    private feedback: UserFeedBack;
    private isEditOrDeleteDisabled: boolean;
    private moveActive: any;
    private isHorizontalTree: boolean;

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
    @Input() isNodeMoveDisabled: boolean;
    @Input() tutorialStatus: TutorialMode;

    @Output() updateNode = new EventEmitter<OrgNodeModel>();
    @Output() deleteNode = new EventEmitter<OrgNodeModel>();
    @Output() updateNodeAndDeleteNode = new EventEmitter<OrgNodeModel>();
    @Output() showFirstNameLabel = new EventEmitter<boolean>();
    @Output() showLastNameLabel = new EventEmitter<boolean>();
    @Output() showDescriptionLabel = new EventEmitter<boolean>();
    @Output() isEditEnabled = new EventEmitter<boolean>();
    @Output() deleteTitle: string;
    @Output() name: string;
    @Output() isNodeMoveEnabledOrDisabled = new EventEmitter<boolean>();
    @Output() isFeedbackInEditMode = new EventEmitter<boolean>();
    @Output() isHorizontalViewEnabled = new EventEmitter<boolean>();
    @Output() verticalSpaceValue = new EventEmitter<number>();
    @Output() horizontalSpaceValue = new EventEmitter<number>();
    @Output() tutorialCurrentStatus = new EventEmitter<TutorialMode>();
    @Output() isDetailPanelClosed = new EventEmitter<boolean>();

    constructor(private orgService: OrgService, private domHelper: DOMHelper) {
        this.feedbackIcon = FEEDBACK_ICON_OPEN;
        this.isFeedbackOpen = false;
        this.isClosed = false;
        this.isEditModeEnabled = false;
        this.editOrSave = EDIT_ICON;
        this.deleteOrClose = DELETE_ICON;
        this.isEditOrDeleteDisabled = false;
        this.isHorizontalTree = false;
        this.verticalSlider = { min: 50, max: 360, value: 70 };
        this.horizontalSlider = { min: 50, max: 360, value: 70 };
        this.verticalSpaceValue.emit(this.verticalSlider.value);
        this.horizontalSpaceValue.emit(this.horizontalSlider.value);
    }

    ngOnInit() {
        this.isNodeMoveEnabledOrDisabled.emit(false);
        this.isFeedbackInEditMode.emit(false);
        this.isHorizontalViewEnabled.emit(false);
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["isNodeMoveDisabled"] && !changes["isNodeMoveDisabled"].currentValue) {
            this.moveActive = "";
        }
        if (changes["orgChart"]) {
            if (this.orgChart) {
                this.isClosed = false;
                this.openPanel();
            } else {
                this.isClosed = true;
                this.closePanel();
            }
        }

        if (changes["isSmartBarAddEnabled"]) {
            if (!this.isSmartBarAddEnabled && this.isCollapsed) {
                this.openPanel();
                this.isCollapsed = false;
            }
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
            } else {
                if (this.feedbackIcon === FEEDBACK_ICON_CLOSE) {
                    this.feedbackIcon = FEEDBACK_ICON_OPEN;
                }
                this.closePanel();
                this.isCollapsed = true;
            }
        }

        if (changes["currentMode"] && this.currentMode === ChartMode.report) {
            this.enableTabControl();
            this.isHorizontalViewEnabled.emit(false);
            this.isHorizontalTree = false;
            this.verticalSpaceValue.emit(this.verticalSlider.value);
            this.horizontalSpaceValue.emit(this.horizontalSlider.value);
        }
    }

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

    openPanel() {
        if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1 && !this.isSmartBarAddEnabled) {
            this.isCollapsed = true;
            this.isClosed = false;
            this.domHelper.setWidth(MenuElement.menuPanel, "100%");
            this.domHelper.setWidth(MenuElement.sideNavfixed, "100%");
            this.domHelper.hideElements(MenuElement.publishData);
            this.domHelper.showElements(`${MenuElement.sidePanelExportData}, ${MenuElement.sendFeedback}`);
            if (this.tutorialStatus === TutorialMode.Continued && this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1) {
                this.isDetailPanelClosed.emit(false);
            }
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
        this.isNodeMoveEnabledOrDisabled.emit(false);
        this.domHelper.hideElements(MenuElement.sendFeedback);
        if (this.tutorialStatus === TutorialMode.Continued && this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1) {
            this.isDetailPanelClosed.emit(true);
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

    changeVericalSlider(data: number) {
        this.verticalSpaceValue.emit(data);
        this.horizontalSpaceValue.emit(this.horizontalSlider.value);
    }
    changeHorizontalSlider(data: number) {
        this.horizontalSpaceValue.emit(data);
        this.verticalSpaceValue.emit(this.verticalSlider.value);
    }
    onReset() {
        this.verticalSlider = { min: 50, max: 360, value: 70 };
        this.horizontalSlider = { min: 50, max: 360, value: 70 };
        this.verticalSpaceValue.emit(this.verticalSlider.value);
        this.horizontalSpaceValue.emit(this.horizontalSlider.value);
    }

    private setLabelVisiblity(event) {
        if (event.target.id === "FirstName") {
            if (event.target.checked === true) {
                this.showFirstNameLabel.emit(true);
            } else {
                this.showFirstNameLabel.emit(false);
            }
        }
        else if (event.target.id === "LastName") {
            if (event.target.checked === true) {
                this.showLastNameLabel.emit(true);
            } else {
                this.showLastNameLabel.emit(false);
            }
        }
        else if (event.target.id === "JobTitle") {
            if (event.target.checked === true) {
                this.showDescriptionLabel.emit(true);
            } else {
                this.showDescriptionLabel.emit(false);
            }
        }
    }

    OnPublish() {
        this.domHelper.hideElements(MenuElement.sidePanelExportData);
        this.domHelper.showElements(MenuElement.publishData);
    }

    OnExport() {
        this.domHelper.showElements(MenuElement.sidePanelExportData);
        this.domHelper.hideElements(MenuElement.publishData);
    }

    changeViewVericalOrHorizonatl(event) {
        if (event.target.id === "verticalView") {
            if (event.target.checked === true) {
                this.isHorizontalViewEnabled.emit(false);
                this.isHorizontalTree = false;
            }
        } else if (event.target.id === "horizontalView") {
            if (event.target.checked === true) {
                this.isHorizontalViewEnabled.emit(true);
                this.isHorizontalTree = true;
            }
        }
    }

    onNodeDeleteConfirm() {
        switch (this.tutorialStatus) {
            case TutorialMode.Started:
            case TutorialMode.Continued:
                this.deleteNode.emit(this.selectedOrgNode);
                this.domHelper.hideElements(`${MenuElement.deleteNodeModal}, ${MenuElement.deleteChildNodeConfirm}, ${MenuElement.deleteNodeConfirm}`);
                break;
            default:
                if (this.selectedNode.NodeID === -1) {
                    this.deleteNode.emit(this.selectedNode);
                } else {
                    if (this.selectedNode.children && this.selectedNode.children.length === 1) {
                        this.orgService.deleteNode(this.selectedNode.NodeID, this.selectedNode.children[0].NodeID)
                            .subscribe(data => this.emitDeleteNodeNotification(data, this.selectedNode.children[0]),
                            error => this.handleError(error),
                            () => console.log("Deleted node."));
                    } else if (this.selectedNode.children && this.selectedNode.children.length > 0) {
                        this.domHelper.hideElements(MenuElement.deleteNodeConfirm);
                        this.domHelper.showElements(MenuElement.deleteChildNodeConfirm);
                    } else {
                        this.orgService.deleteNode(this.selectedNode.NodeID)
                            .subscribe(data => this.emitDeleteNodeNotification(data),
                            error => this.handleError(error),
                            () => console.log("Deleted node."));
                    }
                }
                break;
        }
    }

    onCancelDelete(data: boolean) {
        this.deleteTitle = "";
        this.name = "";
        this.domHelper.hideElements(`${MenuElement.deleteNodeModal}, ${MenuElement.deleteChildNodeConfirm}, ${MenuElement.deleteNodeConfirm}`);
    }

    dismissPopup() {
        this.deleteTitle = "";
        this.name = "";
        this.domHelper.hideElements(`${MenuElement.deleteNodeModal}, ${MenuElement.deleteChildNodeConfirm}, ${MenuElement.deleteNodeConfirm}`);
    }

    onDeleteOrCancelNodeClicked() {
        if (this.selectedNode.NodeID !== -1) {
            this.isNodeMoveEnabledOrDisabled.emit(false);
            if (this.deleteOrClose === DELETE_ICON) {
                if (this.tutorialStatus === TutorialMode.Started || this.tutorialStatus === TutorialMode.Continued) {
                    this.tutorialCurrentStatus.emit(TutorialMode.Interupted);
                } else {
                    this.deleteTitle = "Node";
                    this.name = `${this.selectedOrgNode.NodeFirstName} ${this.selectedOrgNode.NodeLastName}`;
                    this.domHelper.showElements(`${MenuElement.deleteNodeModal}, ${MenuElement.deleteNodeConfirm}`);
                }
            } else if (this.deleteOrClose === CLOSE_ICON) {
                this.editOrSave = EDIT_ICON;
                this.deleteOrClose = DELETE_ICON;
                this.isEditModeEnabled = false;
                this.selectedNode.NodeFirstName = this.editNodeDetails.NodeFirstName;
                this.selectedNode.NodeLastName = this.editNodeDetails.NodeLastName;
                this.selectedNode.Description = this.editNodeDetails.Description;
                this.updateNode.emit(this.selectedNode);
                this.editNodeDetails = null;
                this.isEditEnabled.emit(false);
            }
        }
    }

    private enableTabControl() {
        this.domHelper.initTabControl();
    }

    private emitDeleteNodeNotification(data, childNode?: OrgNodeModel) {
        if (data) {
            if (childNode) {
                childNode.ParentNodeID = this.selectedNode.ParentNodeID;
                this.updateNodeAndDeleteNode.emit(childNode);
            }
            else {
                this.deleteNode.emit(this.selectedNode);
            }
            this.domHelper.hideElements(`${MenuElement.deleteNodeModal}, ${MenuElement.deleteChildNodeConfirm}, ${MenuElement.deleteNodeConfirm}`);
        }
    }

    private isNullOrEmpty(value: string) {
        if (value && value.trim().length > 0) {
            return false;
        }
        return true;
    }

    private onMoveNodeClicked() {
        if (this.selectedOrgNode && this.selectedOrgNode.ParentNodeID !== null) {
            if (this.editOrSave !== SAVE_ICON) {
                this.moveActive = "active";
                this.isNodeMoveEnabledOrDisabled.emit(true);
            }
        }
    }

    private onEditOrSaveNodeClicked() {
        if (this.selectedNode.NodeID !== -1 && !this.isSmartBarAddEnabled) {
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
            this.isNodeMoveEnabledOrDisabled.emit(false);
        }
    }

    private editNode(node: OrgNodeModel) {
        if (this.tutorialStatus === TutorialMode.Started || this.tutorialStatus === TutorialMode.Continued) {
            this.emitUpdateNodeNotification(true);
        } else {
            if (!node) { return; }
            // we don"t really need to send any child info to the server at this point
            node.children = null;
            this.orgService.updateNode(node)
                .subscribe(data => this.emitUpdateNodeNotification(data),
                error => this.handleError(error),
                () => console.log("Updated node."));
        }
    }

    private emitUpdateNodeNotification(data) {
        if (data === true) {
            this.updateNode.emit(this.editNodeDetails);
            this.editNodeDetails = null;
            this.isEditEnabled.emit(false);
        }
    }

    private onEditInputKeyUp(event: KeyboardEvent, ngControl: NgControl) {
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
            } else if (ngControl.name === "description") {
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

    public OnKeyDown(event) {
        if (this.feedbackDescriptionText !== "") {
            this.isFeedbackInEditMode.emit(true);
        } else {
            this.isFeedbackInEditMode.emit(false);
        }

    }

    openOrCloseFeedBackPanel() {
        this.isNodeMoveEnabledOrDisabled.emit(false);
        if (this.feedbackIcon === FEEDBACK_ICON_OPEN) {
            this.isFeedbackOpen = true;
            this.feedbackIcon = FEEDBACK_ICON_CLOSE;
            this.domHelper.setHeight(MenuElement.feedbackPanel, "220px");
            document.querySelector("textarea").focus();
        } else if (this.feedbackIcon === FEEDBACK_ICON_CLOSE) {
            this.isFeedbackInEditMode.emit(false);
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