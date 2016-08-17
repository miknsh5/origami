import { Component, Input, Output, EventEmitter, OnDestroy} from "@angular/core";
import { UserModel } from "../../Shared/models/user.model";
@Component({
    selector: "sg-origami-title-menu-panel",
   // directives: [OrgTreeComponent, OrgNodeDetailComponent, MenuPanelComponent],
    templateUrl: "app/org/title-menu-panel/title-menu-panel.component.html",
    styleUrls: ["app/org/title-menu-panel/title-menu-panel.component.css"]
})

export class TitleMenuPanelComponent {

 @Input() userModel: UserModel;

}