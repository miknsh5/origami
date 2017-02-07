import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer } from "@angular/core";

import { DOMHelper } from "../../shared/index";

const tutorailElementName = {
    tutorailStart: "#tutorialStart",
    smartBarTooltip: "#smart-bar-tooltip",
    tutorialSkipOrContinue: "#tutorial-skip-or-Continue",
    startTutorial: "#start-Tutorial"
};

@Component({
    selector: "pt-tutorial",
    templateUrl: "app/ui/tutorial/tutorial.component.html",
    styleUrls: ["app/ui/tutorial/tutorial.component.css"]
})

export class TutorialComponent implements OnChanges {
    @Input() isActivate: boolean;
    @Input() isOrgNodeEmpty: boolean;
    @Input() isTutorialEnabled: boolean;

    @Output() deactivateTutorial = new EventEmitter<boolean>();


    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if ((changes["isActivate"] && changes["isActivate"].currentValue) || (changes["isTutorialEnabled"] && changes["isTutorialEnabled"].currentValue)) {
            this.domHelper.showElements(tutorailElementName.tutorailStart);
        }
    }

    @HostListener("window:click", ["$event"])
    bodyClicked(event: any) {
        if ((event.target.nodeName !== ("svg" || "SVG")) && (event.target.nodeName !== ("BUTTON" || "button"))) {
            // this.domHelper.showElements(tutorailElementName.tutorialSkipOrContinue);
            // this.domHelper.showElements(tutorailElementName.tutorailStart);
            this.domHelper.hideElements(tutorailElementName.smartBarTooltip);
        } else {

        }

    }

    constructor(private domHelper: DOMHelper, private elementRef: ElementRef) { }
    startTutorial(event: any) {
        this.domHelper.hideElements(tutorailElementName.tutorailStart);
        if (this.isOrgNodeEmpty) {
            this.domHelper.showElements(tutorailElementName.smartBarTooltip);
        }
        if (this.isActivate) {
            this.deactivateTutorial.emit(false);
        }
    }
    skipTutorial() {
        this.domHelper.hideElements(`${tutorailElementName.tutorailStart},${tutorailElementName.smartBarTooltip},${tutorailElementName.tutorialSkipOrContinue}`);
        if (this.isActivate) {
            this.deactivateTutorial.emit(false);
        }
    }

    continueTutorial() {
        console.log("continue");
    }
}
