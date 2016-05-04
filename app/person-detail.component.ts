import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {OrgNode} from './Models/OrgNode';
import {NgForm} from 'angular2/common';

@Component({
    selector: 'my-person-detail',

    template: `
      <div class="detail-wrap">
      <form  #origamiform="ngForm" (ngSubmit)="onSubmit(origamiform)>
        <div class="origamicontrols">
          <div class="close-icon" (click)="deleteClicked(selectedNode)"></div>
         <div *ngIf="!editableMode" class="edit-icon"   (click)="editClicked()"></div>
         
         <button type="submit" *ngIf="editableMode" class="save-icon"   [disabled]="!origamiform.form.valid" ></button>

        </div>
        
        <div *ngIf="selectedNode && !editableMode" class="text-wrap">
       
            <div class="title-name">{{selectedNode.NodeFirstName}}</div>
            <div class="title-position">{{selectedNode.Description}}</div>
        </div>
       <div *ngIf="selectedNode && editableMode" class="form-group text-wrap">
       <input type="text"  class="title-name-edit form-control" required  ngControl="employeename" #employeename="ngForm" [ngModel]="selectedNode.NodeFirstName"/>
   
       <input class="title-position-edit form-control" [ngModel]="selectedNode.Description" required ngControl="employeetitle"  />
       </div>   
       </form>
      </div>
    `,
    styles: [`
        .detail-wrap {
            height: 50px;
            width: 250px;
            position:absolute;
            background-color: #029BFF;
            bottom: 5px;
            left:0;
        }

        .origamicontrols {
           
            left: 10px;
            top:0;
            width: 25px;
            height: 100%;
            background-color: #1565C0;
            display:inline-block;
            float:left;
            position:absolute;
        }

        .text-wrap {
            position:relative;
            left: 40px;
            margin: 8px 0;
            color: #FFFFFF;
            font-family: 'Roboto', sans-serif;
        }

        .title-name {
            font-size: 1.1em;
            font-weight: bolder;
        }
         .title-name-edit {
            font-size: 0.9em;
            font-weight: bolder;
            width:200px;
            height:15px;
            border:none;
        }

        .title-position {
            font-size: 0.9em;
        }
        .title-position-edit {
            font-size: 0.8em;
            width:200px;
            height:12px;
              border:none;
        }

        .selected {
        }
          .edit-icon {
             background-image: url("app/images/pen.png");
            bottom: 2px;
            position: absolute;
            height: 20px;
            width: 20px;
            background-repeat: no-repeat;
            left:4px;
        } 
        .save-icon {
            background-image: url("app/images/save.png");
            bottom: 2px;
            position: absolute;
            height: 15px;
            width: 15px;
           
            left:4px;
            padding: 0;
            border: none;
          background-repeat: no-repeat;
          background-size:contain;
        } 
        .close-icon {
            background-image: url("app/images/close.png");
            top:6px;
            position: absolute;
            height: 20px;
            width: 20px;
            background-repeat: no-repeat;
            left:4px;
        } 
        .ng-valid[required] {
  border-left: 5px solid #42A948; /* green */
}

.ng-invalid {
  border-left: 5px solid #a94442; /* red */
}

    `],
})
export class PersonDetailComponent {
    @Input() selectedNode: OrgNode;
    @Output() deleteNode = new EventEmitter<OrgNode>();
    data: String;
    editableMode: boolean = false;

    onSubmit(form: NgForm) {
        this.data = JSON.stringify(form.value, null, 2)
        this.selectedNode.NodeFirstName = form.value.employeename;
        this.selectedNode.Description = form.value.employeetitle;
        this.editableMode = false;
    }
    editClicked() {
        if (this.selectedNode) {
            this.editableMode = true;
        }
    }
    deleteClicked() {
        this.deleteNode.emit(this.selectedNode);
        this.editableMode = false;
    }
}   