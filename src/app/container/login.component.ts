import { Component, OnInit } from "@angular/core";

import { Router } from "@angular/router";

import { AuthService } from "../shared/index";

@Component({
    selector: "sg-login",
    template: ``
})

export class LoginComponent implements OnInit {
    constructor(private auth: AuthService, private router: Router) { }

    ngOnInit() {
        if (this.auth.authenticated()) {
            this.router.navigate(["home"]);
        } else {
            this.auth.login();
        }
    }
}