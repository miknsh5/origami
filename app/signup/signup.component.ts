import { Component, OnInit } from "@angular/core";

import { Router } from "@angular/router";

import { AuthService } from "../login/index";

@Component({
    selector: "signup",
    template: ``
})

export class SignUpComponent implements OnInit {
    constructor(private auth: AuthService, private router: Router) { }

    ngOnInit() {
        if (this.auth.authenticated()) {
            this.router.navigate(["home"]);
        } else {
            this.auth.signup();
        }
    }
}