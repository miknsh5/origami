import { Routes, RouterModule } from "@angular/router";

import { AuthGuard } from "./login/index";

// Layouts
import { LoginComponent } from "./login/login.component";

// Main view
import { OrgComponent } from "./org/org.component";

const appRoutes: Routes = [
    {
        path: "",
        redirectTo: "/login",
        pathMatch: "full",
    },
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "home",
        component: OrgComponent,
        canActivate: [AuthGuard],
        data: {
            title: "PeopleTree"
        }
    }
];

export const routing = RouterModule.forRoot(appRoutes);
