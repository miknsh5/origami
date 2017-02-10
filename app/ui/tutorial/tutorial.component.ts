import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer } from "@angular/core";

import { DOMHelper, TutorialStatusMode, OrgState, OrgNodeModel } from "../../shared/index";

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
    private tutorailSessionStarted: boolean = false;
    private popupTitle: any;
    private popupContent: any;

    @Input() tutorialStatus: TutorialStatusMode;
    @Input() isOrgNodeEmpty: boolean;
    @Input() orgCurrentState: OrgState;
    @Input() selectedOrgNode: OrgNodeModel;

    @Output() deactivateTutorial = new EventEmitter<TutorialStatusMode>();



    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["tutorialStatus"] && changes["tutorialStatus"].currentValue === TutorialStatusMode.Start) {
            this.domHelper.hideElements(tutorailElementName.tutorialSkipOrContinue);
            this.domHelper.showElements(tutorailElementName.tutorailStart);
        }
        if (this.tutorailSessionStarted) {
            if (changes["tutorialStatus"] && changes["tutorialStatus"].currentValue === TutorialStatusMode.Interupt) {
                this.domHelper.showElements(tutorailElementName.tutorialSkipOrContinue);
            }

            if (changes["orgCurrentState"]) {
                if (this.orgCurrentState === OrgState.AddName) {
                    this.popupTitle = `Text assist shows available actions,let's add a resource`;
                    this.popupContent = `>with Donald Duck selected, press enter to select`;
                    this.domHelper.setBottom(tutorailElementName.smartBarTooltip, "155px");
                    this.domHelper.setWidth(tutorailElementName.smartBarTooltip, "480px");
                } else if (this.orgCurrentState === OrgState.AddJobTitle) {
                    this.popupTitle = `App presumes we want to a title(esc to cancel)`;
                    this.popupContent = `>Type Designer and press enter`;
                    this.domHelper.setWidth(tutorailElementName.smartBarTooltip, "401px");
                }
                else {
                    this.domHelper.hideElements(tutorailElementName.smartBarTooltip);
                }
            }
        }
    }

    constructor(private domHelper: DOMHelper, private elementRef: ElementRef) {
        this.popupTitle = ` Let's add the first person to your organization.`;
        this.popupContent = `>Type Donald Duck`;
    }

    startTutorial(event: any) {
        this.tutorailSessionStarted = true;
        this.domHelper.hideElements(`${tutorailElementName.tutorailStart},${tutorailElementName.tutorialSkipOrContinue}`);
        if (this.isOrgNodeEmpty) {
            this.domHelper.showElements(tutorailElementName.smartBarTooltip);
        }
    }

    skipTutorial() {
        this.domHelper.hideElements(`${tutorailElementName.tutorailStart},${tutorailElementName.smartBarTooltip},${tutorailElementName.tutorialSkipOrContinue}`);
        if (this.tutorialStatus === TutorialStatusMode.Start) {
            this.deactivateTutorial.emit(TutorialStatusMode.End);
        } else if (this.tutorialStatus === TutorialStatusMode.Interupt) {
            this.deactivateTutorial.emit(TutorialStatusMode.Skip);
        }
        this.tutorailSessionStarted = false;
    }

    continueTutorial() {
        this.domHelper.hideElements(tutorailElementName.tutorialSkipOrContinue);
        this.domHelper.showElements(tutorailElementName.smartBarTooltip);
        this.deactivateTutorial.emit(TutorialStatusMode.Continue);
    }
}
