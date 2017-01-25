import { Injectable, NgZone } from "@angular/core";
import { tokenNotExpired } from "angular2-jwt";
import { Router } from "@angular/router";

import { UserModel } from "../model/index";
import { myConfig } from "./auth.config";
import { OrgService } from "../org.service";

declare var Auth0Lock: any;

@Injectable()
export class AuthService {
    lock: any;

    constructor(private router: Router, private zone: NgZone, private orgService: OrgService, ) {
        this.lock = new Auth0Lock(myConfig.clientID, myConfig.domain, {
            closable: false,
            languageDictionary: {
                title: "",
            },
            theme: {
                logo: "http://peopletree.io/images/pt-logo-square.png",
                primaryColor: "#607D8B"
            },
            auth: {
                redirect: false
            },
            rememberLastLogin: false
        });

        this.onAuthenticated();
    }

    login() {
        this.clearStorage();
        this.lock.show({ initialScreen: 'login' });
    }

    signup() {
        this.lock.show({ initialScreen: "signUp" });
    }

    logout() {
        this.clearStorage();

        // Send the user back to the Login after logout
        this.router.navigateByUrl("/login");
    }

    isAuthenticated() {
        return tokenNotExpired();
    }

    private onAuthenticated() {
        this.lock.on("authenticated", (authResult) => {
            localStorage.setItem("id_token", authResult.idToken);
            this.getProfile(authResult.idToken);
        });
    }

    private getProfile(idToken) {
        // Fetch profile information
        this.lock.getProfile(idToken, (error, profile) => {
            if (error) {
                // Handle error
                throw new Error(error);
            }

            let user = new UserModel();
            user.Name = profile.username || profile.nickname;
            user.Picture = profile.picture;
            user.ClientID = profile.clientID;
            user.UserID = profile.identities[0].user_id;
            user.Connection = profile.identities[0].connection;
            user.IsSocial = profile.identities[0].isSocial;
            user.Provider = profile.identities[0].provider;

            if (profile["email"]) {
                user.Email = profile.email;
            }

            if (user.IsSocial && profile.identities && profile.identities.length > 0) {
                user.AccessToken = profile.identities[0].access_token;
            } else {
                user.AccessToken = idToken;
            }

            this.createOrValidateUser(user);
        });
    }

    private createOrValidateUser(user) {
        this.orgService.createUser(user)
            .subscribe(data => {
                localStorage.setItem("profile", JSON.stringify(data));
                this.lock.hide();
                this.zone.run(() => this.router.navigateByUrl("/home"));
            },
            err => {
                alert("User Creation Failed. Please try again later.");
                this.orgService.logError(err);
            });
    }

    private clearStorage() {
        // To log out, just remove the token and profile from local storage
        localStorage.clear()
    }
}