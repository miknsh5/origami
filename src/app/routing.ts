import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./shared/index";

import { LoginComponent, OrgComponent } from "./container/index";

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
