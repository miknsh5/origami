// Core
import { Component, Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import { provide } from '@angular/core';
import { HTTP_PROVIDERS, Http } from '@angular/http';
import { AuthHttp, tokenNotExpired } from 'angular2-jwt';

declare var Auth0Lock;

@Component({
    selector: 'origami',
    templateUrl: 'app/app.component.html',
    styleUrls: ['app/app.component.css'],
})

export class AppComponent implements OnInit {
    lock = new Auth0Lock('bRQg0MUBHOozAIXyHONfZRWsT7JeIqT5', 'axd-origami.auth0.com');

    ngOnInit() { }

    login() {
        this.lock.show(function (err, profile, id_token) {
            if (err) {
                throw new Error(err);
            }
            localStorage.setItem('profile', JSON.stringify(profile));
            localStorage.setItem('id_token', id_token);
        });
    }

    logout() {
        localStorage.removeItem('profile');
        localStorage.removeItem('id_token');
    }

    loggedIn() {
        return tokenNotExpired();
    }
}