import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer } from "@angular/core";

import { DOMHelper, TutorialStatusMode } from "../../shared/index";

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
    @Input() tutorialStatus: TutorialStatusMode;
    @Input() isOrgNodeEmpty: boolean;

    @Output() deactivateTutorial = new EventEmitter<TutorialStatusMode>();



    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["tutorialStatus"] && changes["tutorialStatus"].currentValue === TutorialStatusMode.start ) {
            this.domHelper.hideElements(tutorailElementName.tutorialSkipOrContinue);
            this.domHelper.showElements(tutorailElementName.tutorailStart);
        } else   if (changes["tutorialStatus"] && changes["tutorialStatus"].currentValue === TutorialStatusMode.skip ) {
            this.domHelper.showElements(tutorailElementName.tutorialSkipOrContinue);
        //    this.domHelper.showElements(tutorailElementName.tutorailStart);
        }
    }

    // @HostListener("window:click", ["$event"])
    // bodyClicked(event: any) {
    //     // if ((event.target.nodeName !== ("svg" || "SVG")) && (event.target.nodeName !== ("BUTTON" || "button"))) {
    //     //     console.log(this.tutorialStatus);
    //     //     // if (this.tutorialStatus === TutorialStatusMode.start) {
    //     //     //     this.domHelper.showElements(tutorailElementName.tutorailStart);

    //     //     //     // this.domHelper.showElements(tutorailElementName.tutorialSkipOrContinue);
    //     //     // } else if (this.tutorialStatus === TutorialStatusMode.end) { }

    //     //    this.domHelper.hideElements(tutorailElementName.smartBarTooltip);
    //     // } else {

    //     // }

    // }

    constructor(private domHelper: DOMHelper, private elementRef: ElementRef) { }
    startTutorial(event: any) {
        this.domHelper.hideElements(`${tutorailElementName.tutorailStart},${tutorailElementName.tutorialSkipOrContinue}`);
        if (this.isOrgNodeEmpty) {
            this.domHelper.showElements(tutorailElementName.smartBarTooltip);
        }
    }
    skipTutorial() {
        this.domHelper.hideElements(`${tutorailElementName.tutorailStart},${tutorailElementName.smartBarTooltip},${tutorailElementName.tutorialSkipOrContinue}`);
        if (this.tutorialStatus === TutorialStatusMode.start) {
            this.deactivateTutorial.emit(TutorialStatusMode.end);
        }
    }

    continueTutorial() {
         this.domHelper.hideElements(tutorailElementName.tutorialSkipOrContinue);
         this.domHelper.showElements(tutorailElementName.smartBarTooltip);
    }
}
