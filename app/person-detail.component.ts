import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OrgNode } from './Models/OrgNode';
import { NgForm } from '@angular/common';

@Component({
    selector: 'my-person-detail',

    template: `
        <div class="detail-wrap">
            <form  #origamiform="ngForm">
                <div class="origamicontrols">
                    <div class="close-icon" (click)="deleteClicked(selectedNode)"></div>
                    <div *ngIf="!EditableMode" class="edit-icon"   (click)="editClicked()"></div>         
                    <button type="button" *ngIf="EditableMode" class="save-icon"   [disabled]="!origamiform.form.valid"  (click)="editSaved(origamiform.value)"></button>
                </div>
        
                <div *ngIf="selectedNode && !EditableMode" class="text-wrap">       
                    <div class="title-name">{{selectedNode.NodeFirstName}}</div>
                    <div class="title-position">{{selectedNode.Description}}</div>
                </div>
                <div *ngIf="selectedNode && EditableMode" class="form-group text-wrap">
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
            margin: 5px 0;
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
            height: 18px;
            margin-bottom: 4px;
            border:none;
        }
        .title-position {
            font-size: 0.9em;
        }
        .title-position-edit {
            font-size: 0.8em;
            width:200px;
            height:18px;
            border:none;
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
    EditableMode: boolean = false;
    
    editSaved(value: Object) {
        this.data = JSON.stringify(value, null, 2)
        this.selectedNode.NodeFirstName = value["employeename"];
        this.selectedNode.Description = value["employeetitle"];
        this.EditableMode = false;
    }
    
    editClicked() {
        this.EditableMode = true;
    }
    
    deleteClicked() {
        this.deleteNode.emit(this.selectedNode);
    }
}   