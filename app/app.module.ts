import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule, JsonpModule } from "@angular/http";

import { AUTH_PROVIDERS } from "angular2-jwt";

import { routing, appRoutingProviders } from "./app.routing";

import { AppComponent } from "./app.component";

import {
  OrgComponent, OrgTreeComponent, MenuPanelComponent,
  SideMenuComponent, OrgService, JsonToCSVComponent, TreeToPNGComponent,
  ImportCsvFileComponent, MenuConfirmButtonComponent, DomElementHelper, SamrtBarComponent
} from "./org/index";

import { LoginComponent, AuthService } from "./login/index";

import { SignUpComponent } from "./signup/signup.component";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignUpComponent,
    OrgComponent,
    OrgTreeComponent,
    MenuPanelComponent,
    SideMenuComponent,
    JsonToCSVComponent,
    TreeToPNGComponent,
    ImportCsvFileComponent,
    MenuConfirmButtonComponent,
    SamrtBarComponent
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
