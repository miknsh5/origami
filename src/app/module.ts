import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule, JsonpModule } from "@angular/http";

import { AUTH_PROVIDERS } from "angular2-jwt";

import { routing, appRoutingProviders } from "./routing";

import { AppComponent } from "./app.component";

import {
  OrgTreeComponent, MenuBarComponent, SidePanelComponent, ExportCSVComponent,
  ExportPNGComponent, ImportCSVComponent, ConfirmButtonComponent, SamrtBarComponent
} from "./ui/index";

import { OrgComponent, LoginComponent, SignUpComponent } from "./container/index";

import { AuthService, OrgService, DOMHelper } from "./shared/index"

@NgModule({
  declarations: [
    AppComponent,
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
    ConfirmButtonComponent
  ],
  providers: [
    appRoutingProviders,
    AUTH_PROVIDERS,
    AuthService,
    OrgService,
    DOMHelper
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
