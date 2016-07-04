import { Component, OnInit, NgZone } from "@angular/core";
import { Router } from "@angular/router-deprecated";
import { AuthHttp, tokenNotExpired, AUTH_PROVIDERS } from "angular2-jwt";

declare var Auth0Lock;

@Component({
    selector: "sg-origami-login",
    template: ``
})

export class LoginComponent implements OnInit {
    lock = new Auth0Lock("HraDY4gNnmBBSCP7vu7Z6BMO3mdjIAqn", "origami.auth0.com");
    constructor(private router: Router, private zone: NgZone) { }

    ngOnInit() {
        if (this.loggedIn()) {
            this.router.navigate(["/Home"]);
        } else {
            this.login();
        }
    }

    login() {
        this.lock.show((err, profile, id_token) => {
            if (err) {
                throw new Error(err);
            }
            localStorage.setItem("profile", JSON.stringify(profile));
            localStorage.setItem("id_token", id_token);
            this.zone.run(() => this.router.navigate(["/Home"]));
        });
    }

    loggedIn() {
        return tokenNotExpired();
    }
}