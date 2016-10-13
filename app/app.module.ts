import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule, JsonpModule } from "@angular/http";

import { AUTH_PROVIDERS } from "angular2-jwt";

import { routing, appRoutingProviders } from "./app.routing";

import { AppComponent } from "./app.component";

import {
  OrgComponent, OrgNodeDetailComponent, OrgTreeComponent, MenuPanelComponent,
  SideMenuComponent, OrgService, JsonToCSVComponent, TreeToPNGComponent,
  ImportCsvFileComponent, MenuConfirmButtonComponent, DomElementHelper
} from "./org/index";

import { LoginComponent, AuthService } from "./login/index";

@NgModule({
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
  bootstrap: [AppComponent]
})
export class AppModule { }
