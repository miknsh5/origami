import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer } from "@angular/core";

import { DOMHelper } from "../../shared/index";

const tutorailElementName = {
    tutorailStart: "#tutorialStart",
    smartBarTooltip: "#smart-bar-tooltip"
};

@Component({
    selector: "pt-tutorial",
    templateUrl: "app/ui/tutorial/tutorial.component.html",
    styleUrls: ["app/ui/tutorial/tutorial.component.css"]
})

export class TutorialComponent implements OnChanges {
    @Input() isActivate: boolean;
    @Output() deactivateTutorial = new EventEmitter<boolean>();


    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["isActivate"] && changes["isActivate"].currentValue) {
            this.domHelper.showElements(tutorailElementName.tutorailStart);
        }
    }

    @HostListener("window:click", ["$event"])
    bodyClicked(event: any) {
        // this.domHelper.hideElements(tutorailElementName.tutorailStart);
    }

    constructor(private domHelper: DOMHelper, private elementRef: ElementRef) { }
    startTutorial() {
        this.domHelper.hideElements(tutorailElementName.tutorailStart);
        this.domHelper.showElements(tutorailElementName.smartBarTooltip);
        // let element;
        // element = document.querySelector("input[name=multiInTerm]");
        // console.log(element);
         if (this.isActivate) {
            this.deactivateTutorial.emit(false);
        }
    }
    skipTutorial() {
        this.domHelper.hideElements(tutorailElementName.tutorailStart);
        if (this.isActivate) {
            this.deactivateTutorial.emit(false);
        }
    }
}
