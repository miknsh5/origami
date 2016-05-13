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
    @Input() selectedNode: OrgNodeModel;
    @Output() deleteNode = new EventEmitter<OrgNodeModel>();
    private isEditMode: boolean;
    private isSuccess;
    private node: OrgNodeModel;

    constructor(private orgService: OrgService) {
    }

    private onSubmit(form: NgForm) {
        let data = JSON.stringify(form.value, null, 2);
        this.node = this.selectedNode;
        this.node.NodeFirstName = form.value.firstName;
        this.node.NodeLastName = form.value.lastName;
        this.node.Description = form.value.description;
        let status = this.editNode(this.selectedNode);

    }

    private editNode(node) {
        if (!node) { return; }
        this.orgService.updateNodes(node)
            .subscribe(data => this.setNodeData(data),
            error => this.handelError(error),
            () => console.log('Node Updated Complete'));

    }
    private onEditNodeClicked() {
        this.isEditMode = true;
    }

    private onDeleteNodeClicked() {

        if (this.selectedNode.children.length === 0) {
            this.orgService.deleteNode(this.selectedNode.NodeID)
                .subscribe(data => this.deleteNodes(data),
                error => this.handelError(error),
                () => console.log('Node Deleted Complete'));
        }
        else {
            alert("Delete Child Node First.!");
        }


    }
    private deleteNodes(data) {
        if (data === true) {
            this.deleteNode.emit(this.selectedNode);
        }
    }
    private setNodeData(data) {
        if (data === true) {
            this.isEditMode = false;
            this.selectedNode = this.node;
            this.node = null;
        }
    }

    private handelError(err) {
        alert("OOPs..!!Could not update..!! ");
        console.log(err);
    }

}   