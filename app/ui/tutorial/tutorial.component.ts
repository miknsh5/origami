import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer } from "@angular/core";

import { DOMHelper, TutorialStatusMode, OrgState, OrgNodeModel } from "../../shared/index";

const SEARCH_CONTAINER = "#searchSelection";
const TITLE_SEARCH_CONTAINER = "#titleSearchSelection";

const tutorailElementName = {
    tutorailStart: "#tutorialStart",
    smartBarTooltip: "#smart-bar-tooltip",
    tutorialSkipOrContinue: "#tutorial-skip-or-Continue",
    startTutorial: "#start-Tutorial"
};

const tutorialPopupTitle = {
    step1: "Let's add the first person to your organization.",
    step2: "Text assist shows available actions,let's add a resource",
    step3: "App assumes we want to add a title(if not, just enter again)",
    step4: `You just created your first node! 
            The details panel gives you a dynamic view into
            any details about Donald. 
            You can make it go away at any time by clicking (image)`,
    step5: "Great. Now let's add Donald's team.",
    step6: `Well done! You can always navigate using the arrow keys or the mouse. To add a note just start typing, or navigate to one of these: (image) 
            Also,use the smart bar for search too!`
};
const tutorialPopupContent = {
    step1: ">Type Donald Duck",
    step2: ">with Donald Duck selected, press enter to select",
    step3: ">Type Designer and press enter",
    step5: `>Press right(img) to add a direct report, try "Roger Rabit" and make Roger a "Front End Dev"`,
    emptyString: ""
};

declare let jQuery;

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

            if (changes["orgCurrentState"] || changes["selectedOrgNode"]) {
                console.log(this.selectedOrgNode);
                if (this.orgCurrentState === OrgState.AddName) {
                    setTimeout(() => {
                        this.popupTitle = tutorialPopupTitle.step2;
                        this.popupContent = tutorialPopupContent.step2;
                        let top = (jQuery(SEARCH_CONTAINER).offset().top - 70);
                        this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
                    }, 500);
                } else if (this.orgCurrentState === OrgState.AddJobTitle) {
                    this.popupTitle = tutorialPopupTitle.step3;
                    this.popupContent = tutorialPopupContent.step3;
                } else if (this.orgCurrentState === OrgState.PressEnter) {
                    this.popupTitle = tutorialPopupTitle.step4;
                    this.popupContent = tutorialPopupContent.emptyString;
                    // this.domHelper.setWidth(tutorailElementName.smartBarTooltip, "100%");
                    setTimeout(() => {
                        this.popupTitle = tutorialPopupTitle.step5;
                        this.popupContent = tutorialPopupContent.step5;
                    }, 1500);
                }
                else {
                    this.domHelper.hideElements(tutorailElementName.smartBarTooltip);
                }
            }
        }
    }

    @HostListener("window:resize", ["$event"])
    onResize(event: any) {
        // console.log(jQuery(tutorailElementName.smartBarTooltip).offset());
    }

    constructor(private domHelper: DOMHelper, private elementRef: ElementRef) {
        this.popupTitle = tutorialPopupTitle.step1;
        this.popupContent = tutorialPopupContent.step1;
    }

    startTutorial(event: any) {
        this.tutorailSessionStarted = true;
        this.domHelper.hideElements(`${tutorailElementName.tutorailStart},${tutorailElementName.tutorialSkipOrContinue}`);
        this.domHelper.setTop(tutorailElementName.smartBarTooltip, "505px");
        this.domHelper.showElements(tutorailElementName.smartBarTooltip);



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
