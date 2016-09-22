import { Injectable, NgZone } from '@angular/core';
import { tokenNotExpired } from 'angular2-jwt';
import { Router } from '@angular/router';

import { UserModel } from "../shared/index"

declare var Auth0Lock: any;

@Injectable()
export class AuthService {

  lock = new Auth0Lock("HraDY4gNnmBBSCP7vu7Z6BMO3mdjIAqn", "origami.auth0.com");

  constructor(private router: Router, private zone: NgZone) {    
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
            this.zone.run(() => this.router.navigate(["home"])); 
        });
  }

  logout() {
    // To log out, just remove the token and profile
    // from local storage
    localStorage.removeItem('profile');
    localStorage.removeItem('id_token');

    // Send the user back to the Login after logout
    this.router.navigateByUrl('/login');
  }

  loggedIn() {
    return tokenNotExpired();
  }
}