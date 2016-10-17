import { Component, HostListener, Input, Output, EventEmitter, OnChanges, SimpleChange, AfterContentChecked, ElementRef, Renderer, ViewChild } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";

import { OrgNodeModel, OrgService } from "../shared/index";

@Component({
    selector: "sg-org-node-detail",
    templateUrl: "app/org/org-node-detail/org-node-detail.component.html",
    styleUrls: ["app/org/org-node-detail/org-node-detail.component.css"]
})

export class OrgNodeDetailComponent implements OnChanges, AfterContentChecked {
    @Input() selectedOrgNode: OrgNodeModel;
    @Input() isAddOrEditModeEnabled: boolean;
    @Input() isMenuSettingsEnabled: boolean;

    @Output() deleteNode = new EventEmitter<OrgNodeModel>();
    @Output() updateMenuNode = new EventEmitter<OrgNodeModel>();
    @Output() updateNode = new EventEmitter<OrgNodeModel>();
    @Output() addNode = new EventEmitter<OrgNodeModel>();
    @Output() setAddOrEditModeValue = new EventEmitter<boolean>();
    @Output() chartStructureUpdated = new EventEmitter<any>();

    @ViewChild("firstName") firstName;
    @ViewChild("lastName") lastName;
    @ViewChild("description") description;

    private isInputFocused: boolean;
    private editNodeDetails: OrgNodeModel;
    private orgNode: OrgNodeModel;
    private isFormSubmitted: boolean;

    @HostListener("window:keydown", ["$event"])
    onKeyDown(event: any) {
        event.stopPropagation();
        if (!this.isMenuSettingsEnabled) {
            if ((event as KeyboardEvent).keyCode === 27) {
                if (this.isAddOrEditModeEnabled) {
                    if (!this.orgNode.IsNewRoot && !this.orgNode.ParentNodeID && this.orgNode.NodeID === -1) {
                        this.clearRootNodeDetails();
                    } else {
                        if (this.orgNode.NodeID === -1) {
                            this.deleteNode.emit(this.orgNode);
                            this.setAddOrEditModeValue.emit(false);
                        } else {
                            this.setAddOrEditModeValue.emit(false);
                            this.deleteNode.emit(null);
                        }
                    }
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
                        this.onSubmit();
                    } else {
                        this.onCancelEditClicked();
                        let node: any = this.selectedOrgNode;
                        if (node.parent) {
                            alert("Please enter FirstName.");
                        }
                    }
                }
            }
        }
    }

    constructor(private orgService: OrgService, private renderer: Renderer) { }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["isMenuSettingsEnabled"]) {
            if (this.isAddOrEditModeEnabled && changes["isMenuSettingsEnabled"].currentValue) {
                this.isInputFocused = false;
            } else if (!changes["isMenuSettingsEnabled"].currentValue) {
                this.isInputFocused = true;
            }
        }

        // detects isAddOrEditModeEnabled property has changed
        if (changes["isAddOrEditModeEnabled"]) {
            if (changes["isAddOrEditModeEnabled"].currentValue && !this.isMenuSettingsEnabled) {
                this.isInputFocused = true;
            }
        }
        if (changes["selectedOrgNode"]) {
            if (this.orgNode != null && this.orgNode.NodeID === -1) {
                //  If selected node Initial value has changed and we are in edit Mode then set the edit mode .
                if (this.isAddOrEditModeEnabled && this.isInputFocused) {
                    this.setAddOrEditModeValue.emit(false);
                }
            }
            this.orgNode = this.selectedOrgNode;
        }
    }

    ngAfterContentChecked() {
        if (this.isAddOrEditModeEnabled && this.isInputFocused) {
            let elements: any = document.getElementsByClassName("title-name-edit");
            if (elements.length > 0 && (this.orgNode.IsStaging || this.orgNode.NodeID !== -1)) {
                this.isInputFocused = false;
                this.renderer.invokeElementMethod(elements[0], "focus", []);
            }
        }
    }

    private isNullOrEmpty(value: string) {
        if (value && value.trim().length > 0) {
            return false;
        }
        return true;
    }

    private clearRootNodeDetails() {
        this.orgNode.NodeFirstName = "";
        this.orgNode.NodeLastName = "";
        this.orgNode.Description = "";
        if (!this.orgNode.IsStaging) {
            document.getElementsByTagName("input")[2].value = "";
            document.getElementsByTagName("input")[0].focus();
            this.updateNode.emit(this.orgNode);
        }
    }

    private onSubmit() {
        if (!this.isFormSubmitted) {
            if (!this.isNullOrEmpty(this.firstName.value)) {
                this.isFormSubmitted = true;
                this.editNodeDetails = new OrgNodeModel();
                this.editNodeDetails.NodeFirstName = (this.firstName.value).trim();
                this.editNodeDetails.NodeLastName = (this.lastName.value).trim();
                this.editNodeDetails.Description = (this.description.value).trim();
                this.editNodeDetails.children = this.orgNode.children;
                this.editNodeDetails.NodeID = this.orgNode.NodeID;
                this.editNodeDetails.OrgGroupID = this.orgNode.OrgGroupID;
                this.editNodeDetails.CompanyID = this.orgNode.CompanyID;
                this.editNodeDetails.ParentNodeID = this.orgNode.ParentNodeID;

                if (this.orgNode.NodeID === -1) {
                    if (this.orgNode.IsNewRoot) {
                        this.addNewParentNode(this.editNodeDetails);
                    }
                    else {
                        this.addNewNode(this.editNodeDetails);
                    }
                } else {
                    this.editNode(this.editNodeDetails);
                }
            } else {
                alert("Please enter FirstName.");
            }
        }
    }

    private onInputKeyDownOrUp(event: KeyboardEvent, ngControl: NgControl) {
        if (this.orgNode) {
            let target = (<HTMLInputElement>event.target);
            let node = new OrgNodeModel();
            node.OrgGroupID = this.orgNode.OrgGroupID;
            node.CompanyID = this.orgNode.CompanyID;
            node.ParentNodeID = this.orgNode.ParentNodeID;
            node.NodeID = this.orgNode.NodeID;
            node.IsStaging = this.orgNode.IsStaging;
            node.Description = this.orgNode.Description;
            node.IsFakeRoot = this.orgNode.IsFakeRoot;
            node.IsNewRoot = this.orgNode.IsNewRoot;
            node.children = this.orgNode.children;

            if (ngControl.name === "firstName") {
                this.orgNode.NodeFirstName = node.NodeFirstName = ngControl.value;
                node.NodeLastName = this.orgNode.NodeLastName;
                node.Description = this.orgNode.Description;
            } else if (ngControl.name === "lastName") {
                node.NodeFirstName = this.orgNode.NodeFirstName;
                this.orgNode.NodeLastName = node.NodeLastName = ngControl.value;
                node.Description = this.orgNode.Description;
            }
            else if (ngControl.name === "description") {
                node.NodeFirstName = this.orgNode.NodeFirstName;
                node.NodeLastName = this.orgNode.NodeLastName;
                this.orgNode.Description = node.Description = ngControl.value;
            }

            if (node.IsStaging && node.NodeID === -1) {
                if (this.orgNode.NodeFirstName || this.orgNode.NodeLastName || this.orgNode.Description) {
                    this.orgNode.IsStaging = node.IsStaging = false;
                    this.addNode.emit(node);
                }
            } else {
                if (node.NodeID !== -1) {
                    node.IsStaging = true;
                }
                this.updateNode.emit(node);
            }
        }
    }

    private emitChartUpdatedNotification(data: OrgNodeModel) {
        if (data) {
            this.chartStructureUpdated.emit(data);
            // call emitAddNodeNotification for root node and emitUpdateNodeNotification for children
            this.isFormSubmitted = false;
            this.setAddOrEditModeValue.emit(false);
        }
    }

    private emitAddNodeNotification(data: OrgNodeModel) {
        if (data) {
            this.addNode.emit(data);
            this.orgNode.NodeID = data.NodeID;
            this.orgNode.NodeFirstName = data.NodeFirstName;
            this.orgNode.NodeLastName = data.NodeLastName;
            this.orgNode.Description = data.Description;
            this.isFormSubmitted = false;
            this.setAddOrEditModeValue.emit(false);
        }
    }

    private addNewParentNode(node: OrgNodeModel) {
        if (!node) { return; }
        // we don"t really need to send any child info to the server at this point
        node.children = null;
        this.orgService.addRootNode(node)
            .subscribe(data => this.emitChartUpdatedNotification(data),
            error => this.handleError(error),
            () => console.log("Added new parent."));
    }

    private addNewNode(node: OrgNodeModel) {
        if (!node) { return; }
        // we don"t really need to send any child info to the server at this point
        node.children = null;
        this.orgService.addNode(node)
            .subscribe(data => this.emitAddNodeNotification(data),
            error => this.handleError(error),
            () => console.log("Added new node."));
    }

    private onCancelEditClicked() {
        if (!this.orgNode.IsNewRoot && !this.orgNode.ParentNodeID && this.orgNode.NodeID === -1) {
            this.clearRootNodeDetails();
        } else {
            this.setAddOrEditModeValue.emit(false);
            if (this.orgNode.NodeID === -1) {
                this.deleteNode.emit(this.orgNode);
            } else {
                this.deleteNode.emit(null);
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

    private onEditNodeClicked() {
        this.setAddOrEditModeValue.emit(true);
    }

    private onDeleteNodeClicked() {
        if (this.orgNode.NodeID === -1) {
            this.deleteNode.emit(this.orgNode);
        } else {
            if (this.orgNode.children && this.orgNode.children.length > 0) {
                alert("Delete Child Node First!");
            } else {
                this.orgService.deleteNode(this.orgNode.NodeID)
                    .subscribe(data => this.emitDeleteNodeNotification(data),
                    error => this.handleError(error),
                    () => console.log("Deleted node."));
            }
        }
    }

    private emitDeleteNodeNotification(data) {
        if (data === true) {
            this.deleteNode.emit(this.orgNode);
        }
    }

    private emitUpdateNodeNotification(data) {
        if (data === true) {
            this.updateNode.emit(this.editNodeDetails);
            this.editNodeDetails = null;
            this.isFormSubmitted = false;
            this.setAddOrEditModeValue.emit(false);
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
        this.isFormSubmitted = false;
    }
}