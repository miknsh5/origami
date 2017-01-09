import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./login/index";

import { LoginComponent } from "./login/login.component";
import { SignUpComponent } from "./signup/signup.component";
import { OrgComponent } from "./org/org.component";

const appRoutes: Routes = [
    {
        path: "",
        redirectTo: "/login",
        pathMatch: "full"
    },
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "signup",
        component: SignUpComponent
    },
    {
        path: "home",
        component: OrgComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "**",
        redirectTo: "/login"
    }
];

export const appRoutingProviders: any[] = [
    AuthGuard
];

export const routing = RouterModule.forRoot(appRoutes);
