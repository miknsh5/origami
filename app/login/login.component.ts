import { Component, OnInit, NgZone } from "@angular/core";
import { Router } from "@angular/router-deprecated";
import { AuthHttp, tokenNotExpired, AUTH_PROVIDERS } from "angular2-jwt";

import { UserModel } from "../Shared/index";

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
            let user = new UserModel();
            user.Name = profile.name;
            user.Picture = profile.picture;
            user.ClientID = profile.clientID;
            user.UserID = profile.identities[0].user_id;
            user.Connection = profile.identities[0].connection;
            user.IsSocial = profile.identities[0].isSocial;
            user.Provider = profile.identities[0].provider;
            if (profile["email"]) {
                user.Email = profile.email;
            }

            if (user.IsSocial && profile.identities[0].access_token) {
                user.AccessToken = profile.identities[0].access_token;
            } else {
                user.AccessToken = id_token;
            }

            localStorage.setItem("profile", JSON.stringify(user));
            localStorage.setItem("id_token", id_token);
            this.zone.run(() => this.router.navigate(["/Home"]));
        });
    }

    loggedIn() {
        return tokenNotExpired();
    }
}