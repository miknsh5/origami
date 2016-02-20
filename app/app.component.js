System.register(['angular2/core', 'angular2/router', 'angular2/http', 'angular2-jwt'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, router_1, http_1, angular2_jwt_1;
    var PublicRoute, PrivateRoute, AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (angular2_jwt_1_1) {
                angular2_jwt_1 = angular2_jwt_1_1;
            }],
        execute: function() {
            PublicRoute = (function () {
                function PublicRoute() {
                }
                PublicRoute = __decorate([
                    core_1.Component({
                        selector: 'public-route'
                    }),
                    core_1.View({
                        template: "<h1>Hello from a public route</h1>"
                    }), 
                    __metadata('design:paramtypes', [])
                ], PublicRoute);
                return PublicRoute;
            })();
            PrivateRoute = (function () {
                function PrivateRoute() {
                }
                PrivateRoute = __decorate([
                    router_1.CanActivate(function () { return angular2_jwt_1.tokenNotExpired(); }), 
                    __metadata('design:paramtypes', [])
                ], PrivateRoute);
                return PrivateRoute;
            })();
            AppComponent = (function () {
                function AppComponent(http, authHttp) {
                    this.http = http;
                    this.authHttp = authHttp;
                    this.lock = new Auth0Lock('bRQg0MUBHOozAIXyHONfZRWsT7JeIqT5', 'axd-origami.auth0.com');
                    this.jwtHelper = new angular2_jwt_1.JwtHelper();
                }
                AppComponent.prototype.login = function () {
                    this.lock.show(function (err, profile, id_token) {
                        if (err) {
                            throw new Error(err);
                        }
                        localStorage.setItem('profile', JSON.stringify(profile));
                        localStorage.setItem('id_token', id_token);
                    });
                };
                AppComponent.prototype.logout = function () {
                    localStorage.removeItem('profile');
                    localStorage.removeItem('id_token');
                };
                AppComponent.prototype.loggedIn = function () {
                    return angular2_jwt_1.tokenNotExpired();
                };
                AppComponent.prototype.getThing = function () {
                    this.http.get('http://localhost:3001/ping')
                        .subscribe(function (data) { return console.log(data.json()); }, function (err) { return console.log(err); }, function () { return console.log('Complete'); });
                };
                AppComponent.prototype.getSecretThing = function () {
                    this.authHttp.get('http://localhost:3001/secured/ping')
                        .subscribe(function (data) { return console.log(data.json()); }, function (err) { return console.log(err); }, function () { return console.log('Complete'); });
                };
                AppComponent.prototype.tokenSubscription = function () {
                    this.authHttp.tokenStream.subscribe(function (data) { return console.log(data); }, function (err) { return console.log(err); }, function () { return console.log('Complete'); });
                };
                AppComponent.prototype.useJwtHelper = function () {
                    var token = localStorage.getItem('id_token');
                    console.log(this.jwtHelper.decodeToken(token), this.jwtHelper.getTokenExpirationDate(token), this.jwtHelper.isTokenExpired(token));
                };
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'app',
                        directives: [router_1.ROUTER_DIRECTIVES],
                        template: "\n    <h1>Welcome to Origami</h1>\n    <button *ngIf=\"!loggedIn()\" (click)=\"login()\">Login</button>\n    <button *ngIf=\"loggedIn()\" (click)=\"logout()\">Logout</button>\n    <hr>\n    <div>\n      <button [routerLink]=\"['./PublicRoute']\">Public Route</button>\n      <button *ngIf=\"loggedIn()\" [routerLink]=\"['./PrivateRoute']\">Private Route</button>\n      <router-outlet></router-outlet>\n    </div>\n    <hr>\n    <button (click)=\"getThing()\">Get Thing</button>\n    <button *ngIf=\"loggedIn()\" (click)=\"tokenSubscription()\">Show Token from Observable</button>\n    <button (click)=\"getSecretThing()\">Get Secret Thing</button>\n    <button *ngIf=\"loggedIn()\" (click)=\"useJwtHelper()\">Use Jwt Helper</button>\n  "
                    }),
                    router_1.RouteConfig([
                        { path: '/public-route', component: PublicRoute, as: 'PublicRoute' },
                        { path: '/private-route', component: PrivateRoute, as: 'PrivateRoute' }
                    ]), 
                    __metadata('design:paramtypes', [http_1.Http, angular2_jwt_1.AuthHttp])
                ], AppComponent);
                return AppComponent;
            })();
            exports_1("AppComponent", AppComponent);
        }
    }
});
//# sourceMappingURL=app.component.js.map