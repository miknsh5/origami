import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./shared/index";

import { AdminComponent, LoginComponent, OrgComponent, SignUpComponent } from "./container/index";

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
        path: "admin",
        component: AdminComponent,
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
