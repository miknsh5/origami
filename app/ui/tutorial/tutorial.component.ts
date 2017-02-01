import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer } from "@angular/core";

import { DOMHelper } from "../../shared/index";

const tutorailElementName = {
    tutorailStart: "#tutorialStart"
};

@Component({
    selector: "pt-tutorial",
    templateUrl: "app/ui/tutorial/tutorial.component.html",
    styleUrls: ["app/ui/tutorial/tutorial.component.css"]
})

export class TutorialComponent implements OnChanges {
    @Input() isTutorialActivate: boolean;
    @Output() deactivateTutorial = new EventEmitter<boolean>();


    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["isTutorialActivate"] && changes["isTutorialActivate"].currentValue === true) {
            this.domHelper.showElements(tutorailElementName.tutorailStart);
        }
    }

    @HostListener("window:click", ["$event"])
    bodyClicked(event: any) {
        // this.domHelper.hideElements(tutorailElementName.tutorailStart);
    }

    constructor(private domHelper: DOMHelper) { }
    startTutorial() {

    }
    skipTutorial() {
        this.domHelper.hideElements(tutorailElementName.tutorailStart);
        if (!this.isTutorialActivate) {
            this.deactivateTutorial.emit(false);
        }
    }
}
