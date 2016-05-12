import { Component, Input, Output, EventEmitter } from '@angular/core';
import { COMMON_DIRECTIVES, NgForm, FORM_DIRECTIVES } from '@angular/common';

import { OrgNodeModel } from '../shared/index';

@Component({
    selector: 'org-node-detail',
    templateUrl: 'app/org/org-node-detail/org-node-detail.component.html',
    styleUrls: ['app/org/org-node-detail/org-node-detail.component.css'],
    directives: [ FORM_DIRECTIVES, COMMON_DIRECTIVES ] 
})

export class OrgNodeDetailComponent {
    @Input() selectedNode: OrgNodeModel;
    @Output() deleteNode = new EventEmitter<OrgNodeModel>();
    private isEditMode: boolean;

    private onSubmit(form: NgForm) {
        let data = JSON.stringify(form.value, null, 2);
        this.selectedNode.NodeFirstName = form.value.firstName;
        this.selectedNode.NodeLastName = form.value.lastName;
        this.selectedNode.Description = form.value.description;
        this.isEditMode = false;
    }

    private onEditNodeClicked() {
        this.isEditMode = true;
    }

    private onDeleteNodeClicked() {
        this.deleteNode.emit(this.selectedNode);
    }
}   