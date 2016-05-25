// Core
import { Component, OnInit, Output, EventEmitter, provide } from "@angular/core";
import { CORE_DIRECTIVES } from "@angular/common";
import { ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig } from "@angular/router-deprecated";

import { LoginComponent } from "./login/login.component";
import { OrgComponent } from "./org/index";

@Component({
    selector: "origami",
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES],
    template: "<router-outlet></router-outlet>",
    providers: [ROUTER_PROVIDERS]
})

@RouteConfig([
    { path: "/", redirectTo: ["Login"] },
    { path: "/login", name: "Login", component: LoginComponent, useAsDefault: true },
    { path: "/home", name: "Home", component: OrgComponent },
    { path: "/**", name: "Other", redirectTo: ["Login"] }
])

export class AppComponent {

}