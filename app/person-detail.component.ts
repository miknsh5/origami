import {Component} from 'angular2/core';
import {Person} from './person';

@Component({
    selector: 'my-person-detail',
    inputs: ['person'],
    template: `
      <div class="detail-wrap"></div>
    `,
    styles:[`
        .detail-wrap {
            height: 50px;
            width: 15px;
            position:absolute;
            background-color: #029BFF;
            bottom: 5px;
            left:0;
        }

    `],
})
export class PersonDetailComponent {
    public person: Person;
}