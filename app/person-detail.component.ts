import {Component, Input,Output,EventEmitter} from 'angular2/core';
import {Person} from './person';
import {NgForm} from 'angular2/common';

@Component({
    selector: 'my-person-detail',
   
    template: `
      <div class="detail-wrap">
      <form  #origamiform="ngForm">
        <div class="origamicontrols">
          <div class="close-icon" (click)="deleteClicked(selectedPerson)"></div>
         <div *ngIf="!EditableMode" class="edit-icon" [style.background-image]="getEditImage()"  (click)="editClicked()"></div>
         
         <button *ngIf="EditableMode" class="edit-icon" [style.background-image]="getEditImage()" [disabled]="!origamiform.form.valid"  (click)="editSaved(origamiform.value)"></button>

        </div>
        
        <div *ngIf="selectedPerson && !EditableMode" class="text-wrap">
       
            <div class="title-name">{{selectedPerson.name}}</div>
            <div class="title-position">{{selectedPerson.title}}</div>
        </div>
       <div *ngIf="selectedPerson && EditableMode" class="form-group text-wrap">
       <input type="text"  class="title-name-edit form-control" required  ngControl="employeename" [ngModel]="selectedPerson.name"/>
       <input class="title-position-edit form-control" [ngModel]="selectedPerson.title" required ngControl="employeetitle"  />
       </div>
       </form>
      </div>
    `,
    styles:[`
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
        }

        .text-wrap {
            position:relative;
            left: 20px;
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
        }

        .title-position {
            font-size: 0.9em;
        }
        .title-position-edit {
            font-size: 0.8em;
            width:200px;
            height:10px;
        }

        .selected {
        }
          .edit-icon {
           
            bottom: 2px;
            position: absolute;
            height: 20px;
            width: 20px;
            background-repeat: no-repeat;
            left:4px;
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

    `],
})
export class PersonDetailComponent {
   @Input() selectedPerson:Person;
    @Output() deleteNode = new EventEmitter<Person>();
    data:String;
   EditableMode:boolean=false;
    editSaved(value:Object)
    { this.data = JSON.stringify(value, null, 2)
       
       alert(this.data);
        
        this.selectedPerson.name= value.employeename;
        this.selectedPerson.title= value.employeetitle;
        this.EditableMode=false;
    }
    editClicked()
    {
        this.EditableMode= true;
    }
    deleteClicked()
    {
        
        this.deleteNode.emit(this.selectedPerson);
    }
    getEditImage()
    {
        if(!this.EditableMode)
        {
        return 'url("app/images/pen.png")';
        }
        else
        {
            return 'url("app/images/save.png")';
        }
    }
    onSubmit(value:Object)
    {
        alert("submit called"+value.employeename + value.employeetitle );
    }
}   