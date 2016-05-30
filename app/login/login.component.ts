import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router-deprecated";
import { AuthHttp, tokenNotExpired, AUTH_PROVIDERS } from "angular2-jwt";

declare var Auth0Lock;

@Component({
    selector: "sg-origami-login",
    template: ``
})

export class LoginComponent implements OnInit {
    lock = new Auth0Lock("bRQg0MUBHOozAIXyHONfZRWsT7JeIqT5", "axd-origami.auth0.com");
    constructor(private router: Router) { }

    ngOnInit() {
        if (this.loggedIn()) {
            this.router.navigate(["/Home"]);
        } else {
            this.login();
        }
    }

    login() {
        let self = this;
        this.lock.show(function (err, profile, id_token) {
            if (err) {
                throw new Error(err);
            }
            localStorage.setItem("profile", JSON.stringify(profile));
            localStorage.setItem("id_token", id_token);
            self.router.navigate(["/Home"]);
        });
    }

    loggedIn() {
        return tokenNotExpired();
    }
}