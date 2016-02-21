import {Component, Input} from 'angular2/core';
import {Person} from './person';

@Component({
    selector: 'my-person-detail',
    inputs: ['selectedPerson'],
    template: `
      <div class="detail-wrap">
        <div class="controls"></div>
        <div *ngIf="selectedPerson" class="text-wrap">
            <div class="title-name">{{selectedPerson.name}}</div>
            <div class="title-position">{{selectedPerson.manager}}</div>
        </div>
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

        .controls {
            position:relative;
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

        .title-position {
            font-size: 0.9em;
        }

        .selected {
        }

    `],
})
export class PersonDetailComponent {
}