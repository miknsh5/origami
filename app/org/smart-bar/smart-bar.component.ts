import { Component, HostListener, Input, Output, EventEmitter, OnChanges, SimpleChange, AfterContentChecked, ElementRef, Renderer, ViewChild } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";

import { OrgNodeModel, OrgService } from "../shared/index";

@Component({
    selector: "sg-org-smart-bar",
    templateUrl: "app/org/smart-bar/smart-bar.component.html",
    styleUrls: ["app/org/smart-bar/smart-bar.component.css"]
})

export class SamrtBarComponent {

}