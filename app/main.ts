import { enableProdMode } from "@angular/core";
import { bootstrap }    from "@angular/platform-browser-dynamic";
import { disableDeprecatedForms, provideForms } from "@angular/forms";
import { AppComponent } from "./app.component";
import "rxjs/Rx";

enableProdMode();

bootstrap(AppComponent, [
  disableDeprecatedForms(),
  provideForms()
]).catch((err: any) => console.error(err));