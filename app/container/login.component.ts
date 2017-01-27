import { Component, OnInit } from "@angular/core";

import { Router } from "@angular/router";

import { AuthService } from "../shared/index";

@Component({
    selector: "pt-login",
    template: `<svg class="loader" width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#0097FF">
            <g fill="none" fill-rule="evenodd">
                <g transform="translate(1 1)" stroke-width="2">
                    <circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
                    <path d="M36 18c0-9.94-8.06-18-18-18">
                        <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 18 18"
                        to="360 18 18"
                        dur="1s"
                        repeatCount="indefinite"/>
                    </path>                    
                </g>
            </g>
        </svg>`
})

export class LoginComponent implements OnInit {
    constructor(private auth: AuthService, private router: Router) { }

    ngOnInit() {
        if (this.auth.isAuthenticated()) {
            this.router.navigate(["home"]);
        } else {
            this.auth.login();
        }
    }
}