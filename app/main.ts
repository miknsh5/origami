
import {bootstrap} from 'angular2/platform/browser';
import {AppComponent} from './app.component';
import {provide} from 'angular2/core';
import {RouteConfig, Router, APP_BASE_HREF, ROUTER_PROVIDERS, ROUTER_DIRECTIVES, CanActivate} from 'angular2/router';
import {HTTP_PROVIDERS, Http} from 'angular2/http';
import {AuthHttp, AuthConfig, tokenNotExpired, JwtHelper} from 'angular2-jwt';



bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS,
    provide(AuthHttp, {
        useFactory: (http) => {
            return new AuthHttp(new AuthConfig(), http);
        },
        deps: [Http]
    }),
    provide(APP_BASE_HREF, {useValue:'/'})
]);