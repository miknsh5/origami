import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer, ViewChild, AfterViewInit } from "@angular/core";

import { DOMHelper, TutorialMode, TutorialNodeState, OrgNodeModel } from "../../shared/index";

import { Observable } from "rxjs/Rx";

const SEARCH_CONTAINER = "#searchSelection";
const TITLE_SEARCH_CONTAINER = "#titleSearchSelection";
const SMARTBARTUTORIAL = "smart-bar-tutorial";
const SMARTBARTIP = "smart-bar-tip";
const TIP = "tip";
const SMARTBAR = "input[name=multiInTerm]";
const MENUBAR = "#menuPanel";

const tutorailElementName = {
    tutorailStart: "#tutorialStart",
    smartBarTooltip: "#smart-bar-tooltip",
    tutorialSkipOrContinue: "#tutorial-skip-or-Continue",
    startTutorial: "#start-Tutorial",
    tutorialEndOrRestart: "#tutorial-end-or-restart",
    tutorialTitle: "#tutorialTitle",
    tutorialContent: "#tutorialContent"
};

const tutorialPopupTitle = {
    step1: "Let's add the first person to your organization.",
    step2: "Text assist shows available actions,let's add a resource",
    step3: "App assumes we want to add a title(if not, just enter again)",
    step4: `You just created your first node! 
            The details panel gives you a dynamic view into
            any details about Donald. 
            You can make it go away at any time by clicking  <img src="assets/images/cancel.png">`,
    step5: "Great. Now let's add Donald's team.",
    step6: `Well done! You can always navigate using the arrow keys or the mouse. To add a note just start typing, or navigate to one of these: <img src="assets/images/peer.png">  
            Also,use the smart bar for search too!`
};
const tutorialPopupContent = {
    step1: ">Type Donald Duck",
    step2: ">with Donald Duck selected, press enter to select",
    step3: ">Type Designer and press enter",
    step5: `>Press right <img src="assets/images/rightarrow.png"> to add a direct report, try "Roger Rabbit" and make Roger a "Front End Dev"`,
    emptyString: ""
};

declare let jQuery;

@Component({
    selector: "pt-tutorial",
    templateUrl: "app/ui/tutorial/tutorial.component.html",
    styleUrls: ["app/ui/tutorial/tutorial.component.css"]
})

export class TutorialComponent implements OnChanges {
    private popupTitle: HTMLElement;
    private popupContent: HTMLElement;
    private smartBarTip: any;

    @Input() tutorialMode: TutorialMode;
    @Input() isOrgNodeEmpty: boolean;
    @Input() tutorialNodeState: TutorialNodeState;
    @Input() selectedOrgNode: OrgNodeModel;
    @Input() jsonData: any;
    @Input() tutorialEnabled: boolean;
    @Input() isDetailPanelClosed: boolean;

    @Output() modeChanged = new EventEmitter<TutorialMode>();
    @Output() deleteNode = new EventEmitter<boolean>();

    constructor(private domHelper: DOMHelper, private elementRef: ElementRef) {
        this.smartBarTip = SMARTBARTUTORIAL;
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (this.tutorialEnabled && this.selectedOrgNode) {
            if (this.tutorialNodeState === TutorialNodeState.None && this.tutorialMode === TutorialMode.Continued) {
                this.setToStep1();
            }
            else if (this.tutorialNodeState === TutorialNodeState.AddName) {
                if (this.jsonData[0] && (this.jsonData[0].NodeID === -1 || this.jsonData.NodeID === -1)) {
                    this.setStep(tutorialPopupTitle.step2, tutorialPopupContent.step2);
                }

                if ((this.selectedOrgNode && this.selectedOrgNode.NodeFirstName !== "")) {
                    this.setTop(SEARCH_CONTAINER, tutorailElementName.smartBarTooltip);
                } else if (this.selectedOrgNode && this.selectedOrgNode.Description === "" && this.popupTitle && this.popupTitle.innerHTML === tutorialPopupTitle.step5) {
                    this.setTop(SMARTBAR, tutorailElementName.smartBarTooltip);
                } else {
                    this.setTop(SMARTBAR, tutorailElementName.smartBarTooltip);
                }
            } else if (this.tutorialNodeState === TutorialNodeState.AddJobTitle) {
                if (this.jsonData[0] && (this.jsonData[0].NodeID === -1 || this.jsonData.NodeID === -1)) {
                    this.setStep(tutorialPopupTitle.step3, tutorialPopupContent.step3);
                }
                if ((this.selectedOrgNode && this.selectedOrgNode.Description !== "") || (this.popupTitle && this.popupTitle.innerHTML === tutorialPopupTitle.step5)) {
                    if (this.selectedOrgNode && this.selectedOrgNode.Description === "" && this.popupTitle && this.popupTitle.innerHTML === tutorialPopupTitle.step5) {
                        this.setTop(SMARTBAR, tutorailElementName.smartBarTooltip);
                    }
                    this.setTop(TITLE_SEARCH_CONTAINER, tutorailElementName.smartBarTooltip);
                } else {
                    this.setTop(SMARTBAR, tutorailElementName.smartBarTooltip);
                }
            } else if (this.tutorialNodeState === TutorialNodeState.NodeAdded) {
                if (this.jsonData[0] && !this.isDetailPanelClosed) {
                    if (this.jsonData[0] && (this.jsonData[0].NodeID !== -1 || this.jsonData.NodeID === -1) && this.jsonData[0].NodeID !== this.selectedOrgNode.ParentNodeID) {
                        this.setStep(tutorialPopupTitle.step4, tutorialPopupContent.emptyString);
                        this.smartBarTip = SMARTBARTIP;
                        this.setTop(SMARTBAR, tutorailElementName.smartBarTooltip, 200);
                    }
                } else {
                    if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1 && this.jsonData[0] && this.jsonData[0].NodeID !== this.selectedOrgNode.NodeID) {
                        if (this.selectedOrgNode.ParentNodeID === this.jsonData[0].NodeID) {
                            this.setStep(tutorialPopupTitle.step1, tutorialPopupContent.step1);
                            this.setStep(tutorialPopupTitle.step6, tutorialPopupContent.emptyString);
                            this.smartBarTip = TIP;
                            this.setTop(SMARTBAR, tutorailElementName.smartBarTooltip, 130);

                            setTimeout(() => {
                                this.modeChanged.emit(TutorialMode.Ended);
                            }, 5000);
                        }
                    }
                    else {
                        this.setStep(tutorialPopupTitle.step5, tutorialPopupContent.step5);
                        this.smartBarTip = SMARTBARTUTORIAL;
                        let leftElement = jQuery("input[name=multiInTerm]").offset();
                        if (leftElement) {
                            let left = (leftElement.left);
                            this.domHelper.setLeft(tutorailElementName.smartBarTooltip, left);
                        }
                        this.setTop(SMARTBAR, tutorailElementName.smartBarTooltip);
                    }
                }
            }
        }
    }

    @HostListener("window:resize", ["$event"])
    onResize(event: any) {
    }

    setTop(container, popup, distance = 95) {
        let element = jQuery(container).offset();
        if (element) {
            let top = (element.top - distance);
            this.domHelper.setTop(popup, top);
        }
    }

    startTutorial(event: any) {
        this.modeChanged.emit(TutorialMode.Continued);
        this.setToStep1();
    }

    skipTutorial() {
        if (this.jsonData && this.tutorialEnabled) {
            this.deleteNode.emit(true);
        }
        this.modeChanged.emit(TutorialMode.Skiped);
    }

    continueTutorial() {
        this.modeChanged.emit(TutorialMode.Continued);
        this.domHelper.hideElements(tutorailElementName.tutorialSkipOrContinue);
    }

    restartTutorial() {
        this.deleteNode.emit(true);
        this.smartBarTip = SMARTBARTUTORIAL;
        this.startTutorial(null);
    }

    setStep(stepTitle, stepContent) {
        if (this.tutorialMode !== TutorialMode.Interupted) {
            this.popupTitle = this.elementRef.nativeElement.querySelector(tutorailElementName.tutorialTitle) as HTMLElement;
            if (this.popupTitle) {
                this.popupContent = this.elementRef.nativeElement.querySelector(tutorailElementName.tutorialContent) as HTMLElement;
                this.popupTitle.innerHTML = stepTitle;
                this.popupContent.innerHTML = stepContent;
            } else {
                setTimeout(() => {
                    this.setStep(stepTitle, stepContent);
                }, 500);
            }

        }
    }

    private setToStep1() {
        this.setStep(tutorialPopupTitle.step1, tutorialPopupContent.step1);
        this.smartBarTip = SMARTBARTUTORIAL;
    }
}
