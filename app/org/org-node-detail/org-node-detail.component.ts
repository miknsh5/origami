import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange, AfterContentChecked, ElementRef, Renderer, ViewChild } from "@angular/core";
import { COMMON_DIRECTIVES, NgForm, FORM_DIRECTIVES } from "@angular/common";

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
    isInputFocused: boolean;
    private editNodeDetails: OrgNodeModel;
    orgNode: OrgNodeModel;
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
        }
    }

    ngAfterContentChecked() {
        if (this.isAddOrEditModeEnabled && this.isInputFocused) {
            let elements: any = document.getElementsByTagName("input");
            if (elements.length > 0) {
                this.renderer.invokeElementMethod(elements[0], "focus", []);
                this.isInputFocused = false;
            }
        }
    }

    killKeydownEvent() {
        event.stopPropagation();
    }

    private isNullOrEmpty(value: string) {
        if (value && value.trim().length > 0) {
            return false;
        }
        return true;
    }

    private onSubmit(form: NgForm) {
        if (!this.isNullOrEmpty(form.value.firstName)) {
            this.editNodeDetails = new OrgNodeModel();
            this.editNodeDetails.NodeFirstName = form.value.firstName;
            this.editNodeDetails.NodeLastName = form.value.lastName;
            this.editNodeDetails.Description = form.value.description;
            this.editNodeDetails.children = this.orgNode.children;
            this.editNodeDetails.NodeID = this.orgNode.NodeID;
            this.editNodeDetails.OrgID = this.orgNode.OrgID;
            this.editNodeDetails.ParentNodeID = this.orgNode.ParentNodeID;
            this.orgNode.NodeFirstName = form.value.firstName;
            this.orgNode.NodeLastName = form.value.lastName;
            this.orgNode.Description = form.value.description;
            this.editNode(this.editNodeDetails);
        }
    }

    private onFirstNameBlurred(fname: string) {
        if (this.orgNode.NodeID === -1) {
            if (!this.isNullOrEmpty(fname)) {
                let node = new OrgNodeModel();
                node.NodeFirstName = fname;
                node.children = this.orgNode.children;
                node.OrgID = this.orgNode.OrgID;
                node.ParentNodeID = this.orgNode.ParentNodeID;

                this.addNewNode(node);
            }
        }
    }

    private emitAddNodeNotification(data: OrgNodeModel) {
        if (data) {
            this.addNode.emit(data);
            this.orgNode.NodeID = data.NodeID;
            this.orgNode.NodeFirstName = data.NodeFirstName;
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
        this.setAddOrEditModeValue.emit(false);
        if (this.orgNode.NodeID === -1) {
            this.deleteNode.emit(this.orgNode);
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
        }
        else {
            if (!this.orgNode.children) {
                this.orgService.deleteNode(this.orgNode.NodeID)
                    .subscribe(data => this.emitDeleteNodeNotification(data),
                    error => this.handleError(error),
                    () => console.log("Node Deleted Complete"));
            }
            else {
                alert("Delete Child Node First!");
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
        this.setAddOrEditModeValue.emit(false);
        this.editNodeDetails = null;
    }
}   