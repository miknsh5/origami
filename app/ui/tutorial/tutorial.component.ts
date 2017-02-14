import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer } from "@angular/core";

import { DOMHelper, TutorialStatusMode, OrgState, OrgNodeModel } from "../../shared/index";

const SEARCH_CONTAINER = "#searchSelection";
const TITLE_SEARCH_CONTAINER = "#titleSearchSelection";
const SMARTBARTUTORIAL = "smart-bar-tutorial";
const SMARTBARTIP = "smart-bar-tip";
const TIP = "tip";

const tutorailElementName = {
    tutorailStart: "#tutorialStart",
    smartBarTooltip: "#smart-bar-tooltip",
    tutorialSkipOrContinue: "#tutorial-skip-or-Continue",
    startTutorial: "#start-Tutorial",
    tutorialEndOrRestart: "#tutorial-end-or-restart"
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
    private smartBarTip: any;

    @Input() tutorialStatus: TutorialStatusMode;
    @Input() isOrgNodeEmpty: boolean;
    @Input() orgCurrentState: OrgState;
    @Input() selectedOrgNode: OrgNodeModel;
    @Input() jsonData: any;
    @Output() deactivateTutorial = new EventEmitter<TutorialStatusMode>();

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["tutorialStatus"] && changes["tutorialStatus"].currentValue === TutorialStatusMode.Start) {
            if (changes["tutorialStatus"].previousValue !== TutorialStatusMode.Continue) {
                this.domHelper.hideElements(tutorailElementName.tutorialSkipOrContinue);
                this.domHelper.showElements(tutorailElementName.tutorailStart);
            }
        }
        if (this.tutorailSessionStarted) {
            if (changes["tutorialStatus"] && changes["tutorialStatus"].currentValue === TutorialStatusMode.Interupt) {
                this.domHelper.showElements(tutorailElementName.tutorialSkipOrContinue);
            }

            if (changes["orgCurrentState"] || changes["jsonData"]) {

                if (this.orgCurrentState === OrgState.AddName) {
                    if (this.jsonData[0] && this.jsonData[0].NodeID === -1) {
                        this.popupTitle = tutorialPopupTitle.step2;
                        this.popupContent = tutorialPopupContent.step2;
                    }
                    if ((this.selectedOrgNode && this.selectedOrgNode.NodeFirstName !== "") || this.popupTitle === tutorialPopupTitle.step5) {
                        setTimeout(() => {
                            let element = jQuery(SEARCH_CONTAINER).offset();
                            if (element) {
                                let top = (element.top - 70);
                                this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
                            }
                        }, 500);
                    } else {
                        let element = jQuery("input[name=multiInTerm]").offset();
                        if (element) {
                            let top = (element.top - 85);
                            this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
                        }
                    }
                } else if (this.orgCurrentState === OrgState.AddJobTitle) {
                    if (this.jsonData[0] && this.jsonData[0].NodeID === -1) {
                        this.popupTitle = tutorialPopupTitle.step3;
                        this.popupContent = tutorialPopupContent.step3;
                    }
                    if ((this.selectedOrgNode && this.selectedOrgNode.Description !== "") || this.popupTitle === tutorialPopupTitle.step5) {
                        setTimeout(() => {
                            let element = jQuery(TITLE_SEARCH_CONTAINER).offset();
                            if (element) {
                                let top = (element.top - 70);
                                this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
                            }
                        }, 500);
                    } else {
                        let element = jQuery("input[name=multiInTerm]").offset();
                        if (element) {
                            let top = (element.top - 85);
                            this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
                        }
                    }
                } else if (this.orgCurrentState === OrgState.PressEnter) {
                    if (this.jsonData[0] && this.jsonData[0].NodeID === -1) {
                        this.popupTitle = tutorialPopupTitle.step4;
                        this.popupContent = tutorialPopupContent.emptyString;
                        this.smartBarTip = SMARTBARTIP;
                        let element = jQuery("input[name=multiInTerm]").offset();
                        if (element) {
                            let top = (element.top - 180);
                            this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
                        }
                    }

                    setTimeout(() => {
                        if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1 && this.jsonData[0] && this.jsonData[0].NodeID !== this.selectedOrgNode.NodeID) {
                            if (this.selectedOrgNode.ParentNodeID === this.jsonData[0].NodeID) {
                                this.popupTitle = tutorialPopupTitle.step6;
                                this.popupContent = tutorialPopupContent.emptyString;
                                this.smartBarTip = TIP;
                                let element = jQuery("input[name=multiInTerm]").offset();
                                if (element) {
                                    let top = (element.top - 120);
                                    this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
                                }
                                setTimeout(() => {
                                    this.popupTitle = tutorialPopupTitle.step1;
                                    this.popupContent = tutorialPopupContent.step1;

                                    this.domHelper.hideElements(tutorailElementName.smartBarTooltip);
                                    this.domHelper.showElements(tutorailElementName.tutorialEndOrRestart);

                                }, 5000);
                            }
                        }
                        else {
                            this.popupTitle = tutorialPopupTitle.step5;
                            this.popupContent = tutorialPopupContent.step5;
                            let element = jQuery("input[name=multiInTerm]").offset();
                            this.smartBarTip = SMARTBARTUTORIAL;
                            if (element) {
                                let top = (element.top - 115);
                                this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
                            }
                        }
                    }, 2600);
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
        this.smartBarTip = SMARTBARTUTORIAL;
    }

    startTutorial(event: any) {
        this.tutorailSessionStarted = true;
        this.domHelper.hideElements(`${tutorailElementName.tutorailStart},${tutorailElementName.tutorialSkipOrContinue}`);
        let element = jQuery("input[name=multiInTerm]").offset();
        if (element) {
            let top = (element.top - 85);
            this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
        }
        this.domHelper.showElements(tutorailElementName.smartBarTooltip);
    }

    skipTutorial() {
        this.domHelper.hideElements(`${tutorailElementName.tutorailStart},${tutorailElementName.smartBarTooltip},${tutorailElementName.tutorialSkipOrContinue},${tutorailElementName.tutorialEndOrRestart}`);
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

    restartTutorial() {
        this.domHelper.hideElements(tutorailElementName.tutorialEndOrRestart);
        this.domHelper.setTop(tutorailElementName.smartBarTooltip, "505px");
        this.domHelper.showElements(tutorailElementName.smartBarTooltip);
        this.smartBarTip = SMARTBARTUTORIAL;
        this.deactivateTutorial.emit(TutorialStatusMode.Start);
    }
}
