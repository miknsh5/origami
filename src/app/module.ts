import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule, JsonpModule } from "@angular/http";

import { AUTH_PROVIDERS } from "angular2-jwt";

import { routing, appRoutingProviders } from "./routing";

import { App } from "./app";

import {
  OrgTreeComponent, MenuBarComponent , SideMenuComponent, JsonToCSVComponent, TreeToPNGComponent,
  ImportCsvFileComponent, ConfirmButtonComponent, SamrtBarComponent
} from "./ui/index";

import { OrgComponent, LoginComponent } from "./container/index";

import { AuthService, OrgService, DomElementHelper } from "./shared/index"

@NgModule({
  declarations: [
    App,
    LoginComponent,
    OrgComponent,
    MenuBarComponent,
    SideMenuComponent,
    OrgTreeComponent,
    SamrtBarComponent,
    JsonToCSVComponent,
    TreeToPNGComponent,
    ImportCsvFileComponent,
    ConfirmButtonComponent
  ],
  providers: [
    appRoutingProviders,
    AUTH_PROVIDERS,
    AuthService,
    OrgService,
    DomElementHelper
  ],
  imports: [
    BrowserModule,
    routing,
    FormsModule,
    HttpModule,
    JsonpModule
  ],
  bootstrap: [App]
})
export class AppModule { }
