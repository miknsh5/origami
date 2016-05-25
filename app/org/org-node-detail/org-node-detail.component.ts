import { Component, Input, Output, EventEmitter } from '@angular/core';
import { COMMON_DIRECTIVES, NgForm, FORM_DIRECTIVES } from '@angular/common';

import { OrgNodeModel, OrgService } from '../shared/index';


@Component({
    selector: 'origami-org-node-detail',
    templateUrl: 'app/org/org-node-detail/org-node-detail.component.html',
    styleUrls: ['app/org/org-node-detail/org-node-detail.component.css'],
    directives: [FORM_DIRECTIVES, COMMON_DIRECTIVES]
})

export class OrgNodeDetailComponent {
    @Input() selectedOrgNode: OrgNodeModel;
    @Output() deleteNode = new EventEmitter<OrgNodeModel>();
    @Output() updateNode = new EventEmitter<OrgNodeModel>();

    private isEditMode: boolean;
    private editNodeDetails: OrgNodeModel;

    killKeydownEvent() {
        event.stopPropagation();
    }
    private doesChildNodeExist(node: OrgNodeModel): boolean {

        // console.log(node.children!=null);
        return (node.children != null);
    }
    constructor(private orgService: OrgService) {
    }

    private onSubmit(form: NgForm) {
        let data = JSON.stringify(form.value, null, 2);
        this.editNodeDetails = new OrgNodeModel();
        this.editNodeDetails.NodeFirstName = form.value.firstName;
        this.editNodeDetails.NodeLastName = form.value.lastName;
        this.editNodeDetails.Description = form.value.description;
        this.editNodeDetails.children = this.selectedOrgNode.children;
        this.editNodeDetails.NodeID = this.selectedOrgNode.NodeID;
        this.editNodeDetails.OrgID = this.selectedOrgNode.OrgID;
        this.editNodeDetails.ParentNodeID = this.selectedOrgNode.ParentNodeID;
        this.editNode(this.editNodeDetails);
    }

    private editNode(node: OrgNodeModel) {
        if (!node) { return; }

        /*this.isEditMode = false;
           this.updateNode.emit(node);
           this.editNodeDetails = null;*/
        //we don't really need to send any child info to the server at this point
        node.children = null;
        this.orgService.updateNode(node)
            .subscribe(data => this.emitUpdateNodeNotification(data),
            error => this.handleError(error),
            () => console.log('Node Updated Complete'));
    }
    private onEditNodeClicked() {
        this.isEditMode = true;
    }

    private onDeleteNodeClicked() {

        if (this.selectedOrgNode.children == null) {
            this.orgService.deleteNode(this.selectedOrgNode.NodeID)
                .subscribe(data => this.emitDeleteNodeNotification(data),
                error => this.handleError(error),
                () => console.log('Node Deleted Complete'));
        }
        else {
            alert("Delete Child Node First!");
        }
    }
    private emitDeleteNodeNotification(data) {
        if (data === true) {
            this.deleteNode.emit(this.selectedOrgNode);
        }
    }

    private emitUpdateNodeNotification(data) {
        if (data === true) {
            this.isEditMode = false;
            this.updateNode.emit(this.editNodeDetails);
            this.editNodeDetails = null;
        }
    }

    private handleError(err) {
        alert("OOPs!! Something went wrong!! ");
        console.log(err);
        this.isEditMode = false;
        this.editNodeDetails = null;
    }
}   