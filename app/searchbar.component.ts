import {Component} from 'angular2/core';

@Component({
    selector: 'searchbar',
    template: `
    <div class="search-wrap">
        <div class="search-icon"></div>
        <input class="search-input" [(ngModel)]="search" placeholder="John Doe"/>
    </div>
    `,
    styles:[`
        .search-wrap {
            background-color: #009688;
            width: 300px;
            height: 50px;
            position: fixed;
            left: 20px;
            bottom: 5px;
         }

        .search-input {
            height: 25px;
            margin: 15px;
            margin-top: 10px;
            margin-left: 15%;
            width: 80%;
            background-color: #009688;
            border-color: #ccc;

        }

        .search-icon {
            background-image: url("app/images/search.png");
            top: 16px;
            position: absolute;
            height: 20px;
            width: 20px;
            background-repeat: no-repeat;
            left: 12px;
        }

    `]
})
export class SearchbarComponent {
}