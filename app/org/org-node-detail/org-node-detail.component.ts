import { Component, HostListener, Input, Output, EventEmitter, OnChanges, SimpleChange, AfterContentChecked, ElementRef, Renderer, ViewChild } from "@angular/core";
import { COMMON_DIRECTIVES, NgForm, NgControlName, FORM_DIRECTIVES } from "@angular/common";

import { OrgNodeModel, OrgService } from "../shared/index";

@Component({
    selector: "sg-org-node-detail",
    templateUrl: "app/org/org-node-detail/org-node-detail.component.html",
    styleUrls: ["app/org/org-node-detail/org-node-detail.component.css", "app/style.css"],
    directives: [FORM_DIRECTIVES, COMMON_DIRECTIVES]
})

export class OrgNodeDetailComponent implements OnChanges, AfterContentChecked {
    @Input() selectedOrgNode: OrgNodeModel;
    @Input() isAddOrEditModeEnabled: boolean;

    @Output() deleteNode = new EventEmitter<OrgNodeModel>();
    @Output() updateNode = new EventEmitter<OrgNodeModel>();
    @Output() addNode = new EventEmitter<OrgNodeModel>();
    @Output() setAddOrEditModeValue = new EventEmitter<boolean>();
    @ViewChild("firstName") firstName;
    @ViewChild("lastName") lastName;
    @ViewChild("description") description;

    @HostListener("window:keydown", ["$event"])
    onKeyDown(event: any) {
        event.stopPropagation();
        if ((event as KeyboardEvent).keyCode === 27) {
            if (this.isAddOrEditModeEnabled) {
                if (!this.orgNode.ParentNodeID && this.orgNode.NodeID === -1) {
                    this.clearRootNodeDetails();
                } else {
                    this.setAddOrEditModeValue.emit(false);
                    if (this.orgNode.NodeID === -1) {
                        this.deleteNode.emit(this.orgNode);
                    }
                }
            }
        }
    }

    @HostListener("window:click", ["$event"])
    onClick(event: any) {
        event.stopPropagation();
        if (event.srcElement.nodeName === "svg") {
            if (this.firstName && this.lastName && this.description) {
                if (this.firstName.value !== this.orgNode.NodeFirstName || this.lastName.value !== this.orgNode.NodeLastName || this.description.value !== this.orgNode.Description) {
                    this.onSubmit();
                } else {
                    this.onCancelEditClicked();
                }
            }
        }
    }

    isInputFocused: boolean;
    private editNodeDetails: OrgNodeModel;
    private orgNode: OrgNodeModel;
    private isFormSubmitted: boolean;

    constructor(private orgService: OrgService, private renderer: Renderer) { }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        // detects isAddOrEditModeEnabled property has changed
        if (changes["isAddOrEditModeEnabled"]) {
            if (changes["isAddOrEditModeEnabled"].currentValue) {
                this.isInputFocused = true;
            }
        }
        if (changes["selectedOrgNode"]) {
            this.orgNode = this.selectedOrgNode;
            if (this.orgNode != null && this.orgNode.NodeID !== -1) {
                //  If selected node has changed and we are in add Mode by anychance then come out of it.
                if (this.isAddOrEditModeEnabled) {
                    this.setAddOrEditModeValue.emit(false);
                }
            }
        }
    }

    ngAfterContentChecked() {
        if (this.isAddOrEditModeEnabled && this.isInputFocused) {
            let elements: any = document.getElementsByTagName("input");
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
        if (!this.isNullOrEmpty(this.firstName.value) && !this.isFormSubmitted) {
            this.isFormSubmitted = true;
            this.editNodeDetails = new OrgNodeModel();
            this.editNodeDetails.NodeFirstName = this.firstName.value;
            this.editNodeDetails.NodeLastName = this.lastName.value;
            this.editNodeDetails.Description = this.description.value;
            this.editNodeDetails.children = this.orgNode.children;
            this.editNodeDetails.NodeID = this.orgNode.NodeID;
            this.editNodeDetails.OrgID = this.orgNode.OrgID;
            this.editNodeDetails.ParentNodeID = this.orgNode.ParentNodeID;

            if (this.orgNode.NodeID === -1) {
                this.addNewNode(this.editNodeDetails);
            } else {
                this.editNode(this.editNodeDetails);
            }
        }
    }

    private onInputKeyDownOrUp(event: KeyboardEvent, ngControl: NgControlName) {
        if (this.orgNode && this.orgNode.NodeID === -1) {
            let target = (<HTMLInputElement>event.target);
            let node = new OrgNodeModel();
            node.OrgID = this.orgNode.OrgID;
            node.ParentNodeID = this.orgNode.ParentNodeID;
            node.NodeID = this.orgNode.NodeID;
            node.IsStaging = this.orgNode.IsStaging;
            if (this.isFirstAndLastNameInitialChanged(target.value, ngControl)) {
                if (ngControl.name === "firstName") {
                    this.orgNode.NodeFirstName = node.NodeFirstName = ngControl.value;
                    node.NodeLastName = this.orgNode.NodeLastName;
                } else {
                    node.NodeFirstName = this.orgNode.NodeFirstName;
                    this.orgNode.NodeLastName = node.NodeLastName = ngControl.value;
                }

                if (node.IsStaging) {
                    this.orgNode.IsStaging = node.IsStaging = false;
                    this.addNode.emit(node);
                } else {
                    this.updateNode.emit(node);
                }
            }
        }
    }

    private isFirstAndLastNameInitialChanged(value: string, ngControl: NgControlName) {
        if (ngControl.name === "firstName" && value.slice(0, 1) !== this.orgNode.NodeFirstName.slice(0, 1)) {
            return true;
        }
        if (ngControl.name === "lastName" && value.slice(0, 1) !== this.orgNode.NodeLastName.slice(0, 1)) {
            return true;
        }
        return false;
    }

    private emitAddNodeNotification(data: OrgNodeModel) {
        if (data) {
            this.addNode.emit(data);
            this.orgNode.NodeID = data.NodeID;
            this.orgNode.NodeFirstName = data.NodeFirstName;
            this.orgNode.NodeLastName = data.NodeLastName;
            this.orgNode.Description = data.Description;
            this.isFormSubmitted = false;
        }
    }

    private addNewNode(node: OrgNodeModel) {
        if (!node) { return; }
        // we don"t really need to send any child info to the server at this point
        node.children = null;
        this.orgService.addNode(node)
            .subscribe(data => this.emitAddNodeNotification(data),
            error => this.handleError(error),
            () => console.log("Node Added Complete"));
    }

    private onCancelEditClicked() {
        if (!this.orgNode.ParentNodeID && this.orgNode.NodeID === -1) {
            this.clearRootNodeDetails();
        } else {
            this.setAddOrEditModeValue.emit(false);
            if (this.orgNode.NodeID === -1) {
                this.deleteNode.emit(this.orgNode);
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
            () => console.log("Node Updated Complete"));
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
                    () => console.log("Node Deleted Complete"));
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
        /*if (this.orgNode.ParentNodeID) {
             if (this.orgNode.NodeID !== -1) {
                 this.setAddOrEditModeValue.emit(false);
             }
         }*/
        this.editNodeDetails = null;
        this.isFormSubmitted = false;
    }
}   