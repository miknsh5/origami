import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer, ViewChild, AfterViewInit } from "@angular/core";

import { DOMHelper, TutorialStatusMode, OrgState, OrgNodeModel } from "../../shared/index";

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
    step5: `>Press right <img src="assets/images/rightarrow.png"> to add a direct report, try "Roger Rabit" and make Roger a "Front End Dev"`,
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
    private popupTitle: HTMLElement;
    private popupContent: HTMLElement;
    private smartBarTip: any;
    timer: any;

    @Input() tutorialStatus: TutorialStatusMode;
    @Input() isOrgNodeEmpty: boolean;
    @Input() orgCurrentState: OrgState;
    @Input() selectedOrgNode: OrgNodeModel;
    @Input() jsonData: any;

    @Output() deactivateTutorial = new EventEmitter<TutorialStatusMode>();
    @Output() deleteNode = new EventEmitter<boolean>();

    constructor(private domHelper: DOMHelper, private elementRef: ElementRef) {
        this.smartBarTip = SMARTBARTUTORIAL;
        this.timer = Observable.timer(500, 100);
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["tutorialStatus"] && changes["tutorialStatus"].currentValue === TutorialStatusMode.Start) {
            if (changes["tutorialStatus"].previousValue !== TutorialStatusMode.Continue) {
                this.domHelper.hideElements(tutorailElementName.tutorialSkipOrContinue);
                this.domHelper.showElements(tutorailElementName.tutorailStart);
            }
        }
        if (this.tutorailSessionStarted) {
            if (changes["tutorialStatus"] && changes["tutorialStatus"].currentValue === TutorialStatusMode.Interupt || this.orgCurrentState === OrgState.AddRoot) {
                this.domHelper.showElements(tutorailElementName.tutorialSkipOrContinue);
            }

            if (changes["orgCurrentState"] || changes["jsonData"]) {

                if (this.orgCurrentState === OrgState.AddName) {
                    if (this.jsonData[0] && (this.jsonData[0].NodeID === -1 || this.jsonData.NodeID === -1)) {
                        this.popupTitle.innerHTML = tutorialPopupTitle.step2;
                        this.popupContent.innerHTML = tutorialPopupContent.step2;
                    }

                    if ((this.selectedOrgNode && this.selectedOrgNode.NodeFirstName !== "")) {
                        this.setTop(85, SEARCH_CONTAINER, tutorailElementName.smartBarTooltip);
                    } else if (this.selectedOrgNode && this.selectedOrgNode.Description === "" && this.popupTitle.innerHTML === tutorialPopupTitle.step5) {
                        this.setTop(95, SMARTBAR, tutorailElementName.smartBarTooltip);
                    } else {
                        this.setTop(95, SMARTBAR, tutorailElementName.smartBarTooltip);
                    }
                } else if (this.orgCurrentState === OrgState.AddJobTitle) {
                    if (this.jsonData[0] && (this.jsonData[0].NodeID === -1 || this.jsonData.NodeID === -1)) {
                        this.popupTitle.innerHTML = tutorialPopupTitle.step3;
                        this.popupContent.innerHTML = tutorialPopupContent.step3;
                    }
                    if ((this.selectedOrgNode && this.selectedOrgNode.Description !== "") || this.popupTitle.innerHTML === tutorialPopupTitle.step5) {
                        if (this.selectedOrgNode && this.selectedOrgNode.Description === "" && this.popupTitle.innerHTML === tutorialPopupTitle.step5) {
                            this.setTop(95, SMARTBAR, tutorailElementName.smartBarTooltip);
                        }
                        this.setTop(85, TITLE_SEARCH_CONTAINER, tutorailElementName.smartBarTooltip);
                    } else {
                        this.setTop(95, SMARTBAR, tutorailElementName.smartBarTooltip);
                    }
                } else if (this.orgCurrentState === OrgState.PressEnter) {
                    setTimeout(() => {
                        if (this.jsonData[0] && (this.jsonData[0].NodeID !== -1 || this.jsonData.NodeID === -1) && this.jsonData[0].NodeID !== this.selectedOrgNode.ParentNodeID) {
                            this.popupTitle.innerHTML = tutorialPopupTitle.step4;
                            this.popupContent.innerHTML = tutorialPopupContent.emptyString;
                            this.smartBarTip = SMARTBARTIP;

                            let leftElement = jQuery("#menuPanel").offset();
                            if (leftElement) {
                                let left = (leftElement.left - 540);
                                this.domHelper.setLeft(tutorailElementName.smartBarTooltip, left);
                            }

                            this.setTop(200, SMARTBAR, tutorailElementName.smartBarTooltip);
                        }
                    }, 300);


                    setTimeout(() => {
                        if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1 && this.jsonData[0] && this.jsonData[0].NodeID !== this.selectedOrgNode.NodeID) {
                            if (this.selectedOrgNode.ParentNodeID === this.jsonData[0].NodeID) {
                                this.popupTitle.innerHTML = tutorialPopupTitle.step6;
                                this.popupContent.innerHTML = tutorialPopupContent.emptyString;
                                this.smartBarTip = TIP;
                                this.setTop(120, SMARTBAR, tutorailElementName.smartBarTooltip);

                                setTimeout(() => {
                                    this.popupTitle.innerHTML = tutorialPopupTitle.step1;
                                    this.popupContent.innerHTML = tutorialPopupContent.step1;

                                    this.domHelper.hideElements(tutorailElementName.smartBarTooltip);
                                    this.domHelper.showElements(tutorailElementName.tutorialEndOrRestart);

                                }, 7000);
                            }
                        }
                        else {
                            this.popupTitle.innerHTML = tutorialPopupTitle.step5;
                            this.popupContent.innerHTML = tutorialPopupContent.step5;
                             this.smartBarTip = SMARTBARTUTORIAL;
                            let leftElement = jQuery("input[name=multiInTerm]").offset();
                            if (leftElement) {
                                let left = (leftElement.left);
                                this.domHelper.setLeft(tutorailElementName.smartBarTooltip, left);
                            }
                            this.setTop(115, SMARTBAR, tutorailElementName.smartBarTooltip);
                        }
                    }, 4000);
                    // this.timer.subscribe(this.displayStepFourth());
                    // this.timer.subscribe(this.displayStepFifthAndSixth());
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

    setTop(distance, container, popup) {
        let element = jQuery(container).offset();
        if (element) {
            let top = (element.top - distance);
            this.domHelper.setTop(popup, top);
        }
    }

    // setLeft(distance) {
    //     let leftElement = jQuery(MENUBAR).offset();
    //     if (leftElement) {
    //         let left = (leftElement.left - distance);
    //         this.domHelper.setLeft(tutorailElementName.smartBarTooltip, left);
    //     }
    // }

    // displayStepFourth() {
    //     if (this.jsonData[0] && (this.jsonData[0].NodeID !== -1 || this.jsonData.NodeID === -1) && this.jsonData[0].NodeID !== this.selectedOrgNode.ParentNodeID) {
    //         this.popupTitle.innerHTML = tutorialPopupTitle.step4;
    //         this.popupContent.innerHTML = tutorialPopupContent.emptyString;
    //         this.smartBarTip = SMARTBARTIP;
    //         this.setLeft(765);
    //         this.setTop(200, SMARTBAR, tutorailElementName.smartBarTooltip);
    //     }
    // }

    // displayStepFifthAndSixth() {
    //     if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1 && this.jsonData[0] && this.jsonData[0].NodeID !== this.selectedOrgNode.NodeID) {
    //         if (this.selectedOrgNode.ParentNodeID === this.jsonData[0].NodeID) {
    //             this.popupTitle.innerHTML = tutorialPopupTitle.step6;
    //             this.popupContent.innerHTML = tutorialPopupContent.emptyString;
    //             this.smartBarTip = TIP;

    //             this.setTop(120, SMARTBAR, tutorailElementName.smartBarTooltip);

    //             setTimeout(() => {
    //                 this.popupTitle.innerHTML = tutorialPopupTitle.step1;
    //                 this.popupContent.innerHTML = tutorialPopupContent.step1;

    //                 this.domHelper.hideElements(tutorailElementName.smartBarTooltip);
    //                 this.domHelper.showElements(tutorailElementName.tutorialEndOrRestart);

    //             }, 7000);
    //         }
    //     } else {
    //         this.popupTitle.innerHTML = tutorialPopupTitle.step5;
    //         this.popupContent.innerHTML = tutorialPopupContent.step5;

    //         this.setLeft(130);
    //         this.setTop(115, SMARTBAR, tutorailElementName.smartBarTooltip);
    //         this.smartBarTip = SMARTBARTUTORIAL;
    //     }
    // }

    startTutorial(event: any) {
        this.domHelper.showElements(tutorailElementName.smartBarTooltip);
        this.popupTitle = this.elementRef.nativeElement.querySelector(tutorailElementName.tutorialTitle) as HTMLElement;
        this.popupContent = this.elementRef.nativeElement.querySelector(tutorailElementName.tutorialContent) as HTMLElement;
        this.popupTitle.innerHTML = tutorialPopupTitle.step1;
        this.popupContent.innerHTML = tutorialPopupContent.step1;
        this.tutorailSessionStarted = true;
        this.domHelper.hideElements(`${tutorailElementName.tutorailStart},${tutorailElementName.tutorialSkipOrContinue}`);
        let element = jQuery("input[name=multiInTerm]").offset();
        if (element) {
            let top = (element.top - 85);
            this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
        }
    }

    skipTutorial() {
        this.domHelper.hideElements(`${tutorailElementName.tutorailStart},${tutorailElementName.smartBarTooltip},${tutorailElementName.tutorialSkipOrContinue},${tutorailElementName.tutorialEndOrRestart}`);
        if (this.tutorialStatus === TutorialStatusMode.Start) {
            this.deactivateTutorial.emit(TutorialStatusMode.End);
        } else if (this.tutorialStatus === TutorialStatusMode.Interupt) {
            this.deactivateTutorial.emit(TutorialStatusMode.Skip);
        }

        if (this.jsonData && this.tutorailSessionStarted) {
            this.deleteNode.emit(true);
        }
        this.tutorailSessionStarted = false;

        this.popupTitle.innerHTML = tutorialPopupTitle.step1;
        this.popupContent.innerHTML = tutorialPopupContent.step1;

        let element = jQuery("input[name=multiInTerm]").offset();
        if (element) {
            let top = (element.top - 85);
            this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
        }
        this.smartBarTip = SMARTBARTUTORIAL;
    }

    continueTutorial() {
        this.domHelper.hideElements(tutorailElementName.tutorialSkipOrContinue);
        this.domHelper.showElements(tutorailElementName.smartBarTooltip);
        this.deactivateTutorial.emit(TutorialStatusMode.Continue);
    }

    restartTutorial() {
        this.domHelper.hideElements(tutorailElementName.tutorialEndOrRestart);
        let element = jQuery("input[name=multiInTerm]").offset();
        if (element) {
            let top = (element.top - 85);
            this.domHelper.setTop(tutorailElementName.smartBarTooltip, top);
        }
        this.popupTitle.innerHTML = tutorialPopupTitle.step1;
        this.popupContent.innerHTML = tutorialPopupContent.step1;
        this.domHelper.showElements(tutorailElementName.smartBarTooltip);
        this.smartBarTip = SMARTBARTUTORIAL;
        this.deactivateTutorial.emit(TutorialStatusMode.Start);
        this.deleteNode.emit(true);
    }
}
