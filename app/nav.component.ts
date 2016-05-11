import { Component } from '@angular/core';

@Component({
    selector: 'nav',
    template: `
        <div>
            <div class="nav-btn radial-mode"></div>
            <div class="nav-btn tree-mode"></div>
        </div>
    `,
    styles:[`
        .nav-btn {
            position:relative;
            width: 60px;
            height: 60px;
            background-repeat: no-repeat;
            margin: 20px;
        }

        .nav-btn:hover {
            left: 5px;
            cursor: pointer;
        }

        .radial-mode {
            background-image: url("app/images/nav-radial.png");
        }
        .tree-mode {
            background-image: url("app/images/nav-tree.png");
        }
    `]
})
export class NavComponent {
}