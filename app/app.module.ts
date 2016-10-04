import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import {  HttpModule } from "@angular/http";
import { AUTH_PROVIDERS } from "angular2-jwt";
import { FormsModule } from "@angular/forms";

import { routing } from "./app.routing";

import { AppComponent } from "./app.component";

import { OrgComponent, OrgNodeDetailComponent, OrgTreeComponent, MenuPanelComponent,
  SideMenuComponent, OrgService, JsonToCSVComponent, TreeToPNGComponent,
  ImportCsvFileComponent, MenuConfirmButtonComponent, DomElementHelper } from "./org/index";

import { LoginComponent, AuthGuard, AuthService } from "./login/index";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    routing,
    HttpModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    OrgComponent,
    OrgNodeDetailComponent,
    OrgTreeComponent,
    MenuPanelComponent,
    SideMenuComponent,
    JsonToCSVComponent,
    TreeToPNGComponent,
    ImportCsvFileComponent,
    MenuConfirmButtonComponent
  ],
  providers: [
    AUTH_PROVIDERS,
    AuthGuard,
    AuthService,
    OrgService,
    DomElementHelper
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
