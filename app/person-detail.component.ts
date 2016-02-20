import {Component} from 'angular2/core';
import {Person} from './person';

@Component({
    selector: 'my-hero-detail',
    inputs: ['person'],
    template: `
      <div *ngIf="person">
        <h2>{{hero.name}} details!</h2>
        <div><label>id: </label>{{hero.id}}</div>
        <div>
          <label>name: </label>
          <input [(ngModel)]="person.name" placeholder="name"/>
        </div>
      </div>
    `,
})
export class PersonDetailComponent {
    public person: Person;
}