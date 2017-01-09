import { Injectable, NgZone } from "@angular/core";
import { tokenNotExpired } from "angular2-jwt";
import { Router } from "@angular/router";

import { UserModel } from "../model/index";
import { myConfig } from "./auth.config";

declare var Auth0Lock: any;

@Injectable()
export class AuthService {
    lock: any;

    constructor(private router: Router, private zone: NgZone) {
        this.lock = new Auth0Lock(myConfig.clientID, myConfig.domain, {
            closable: false,
            theme: {
                logo: 'http://peopletree.io/images/logo-beta.svg',
                primaryColor: '#607D8B'
            },
            auth: {
                redirect: false
            },
            rememberLastLogin: false
        });

        this.onAuthenticated();
    }

    login() {
        this.lock.show({
            allowSignUp: false, languageDictionary: {
                title: "Log In"
            }
        });
    }

    signup() {
        this.lock.show({
            allowLogin: false, languageDictionary: {
                title: "Sign Up"
            }
        });
    }

    logout() {
        // To log out, just remove the token and profile from local storage
        localStorage.removeItem("profile");
        localStorage.removeItem("id_token");

        // Send the user back to the Login after logout
        this.router.navigateByUrl("/login");
    }

    authenticated() {
        var token = localStorage.getItem('id_token');
        if (token) {
            return true;
        }
        return tokenNotExpired();
    }

    private onAuthenticated() {
        this.lock.on("authenticated", (authResult) => {
            localStorage.setItem('id_token', authResult.idToken);

            // Fetch profile information
            this.lock.getProfile(authResult.idToken, (error, profile) => {
                if (error) {
                    // Handle error
                    throw new Error(error);
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
                    user.AccessToken = authResult.idToken;
                }

                localStorage.setItem('profile', JSON.stringify(user));
                this.lock.hide();
                this.zone.run(() => this.router.navigateByUrl("/home"));
            });
        });
    }
}