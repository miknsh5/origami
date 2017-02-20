import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule, JsonpModule } from "@angular/http";

import { AUTH_PROVIDERS } from "angular2-jwt";

import { routing, appRoutingProviders } from "./routing";

import { AppComponent } from "./app.component";

import {
  OrgTreeComponent, MenuBarComponent, SidePanelComponent, ExportCSVComponent,
  ExportPNGComponent, ImportCSVComponent, ConfirmButtonComponent, SamrtBarComponent, TutorialComponent
} from "./ui/index";

import { AdminComponent, OrgComponent, LoginComponent, SignUpComponent } from "./container/index";

import { AuthService, OrgService, DOMHelper, Cookie } from "./shared/index";

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    LoginComponent,
    SignUpComponent,
    OrgComponent,
    MenuBarComponent,
    SidePanelComponent,
    OrgTreeComponent,
    SamrtBarComponent,
    ExportCSVComponent,
    ExportPNGComponent,
    ImportCSVComponent,
    ConfirmButtonComponent,
    TutorialComponent
  ],
  providers: [
    appRoutingProviders,
    AUTH_PROVIDERS,
    AuthService,
    OrgService,
    DOMHelper,
    Cookie
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
