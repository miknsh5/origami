import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";

import { DraggedNode, OrgNodeModel, OrgSearchModel, OrgService, DomElementHelper } from "../../shared/index";

const HeaderTitle = "NAME";
const AddResource = "Search, Add Resources";
const AddJobTitle = "Add Job Title";
const SaveData = "Press enter to save";
const SELECTED = "selected";
const SEARCH_CONTAINER = "#searchSelection";
const TITLE_SEARCH_CONTAINER = "#titleSearchSelection";
const EMPTYSTRING = "";
declare let jQuery;

@Component({
    selector: "sg-smart-bar",
    templateUrl: "app/org/smart-bar/smart-bar.component.html",
    styleUrls: ["app/org/smart-bar/smart-bar.component.css"]
})

export class SamrtBarComponent implements OnChanges {
    private searchHeader: string;
    private prevSearchTerm: any;
    private orgSearchData: OrgSearchModel[];
    private searchTerm: string = EMPTYSTRING;
    private multiInTerm: string = EMPTYSTRING;
    private nodeSearchedList: OrgSearchModel[];
    private titleFilterList: any[];
    private newNodeValue: any[];
    private nodeTitleSearchedList: OrgSearchModel[];
    private searchInProgress: boolean = false;
    private isTitleSelected: boolean = false;
    private newOrgNode: OrgNodeModel;
    private isDescriptionText: boolean = false;
    private isDescriptionselected: boolean = false;
    private exsitingSearchList: OrgSearchModel[];
    private isSearchEnabled: boolean = false;
    private placeholderText: any;

    @Input() treeJsonData: any;
    @Input() selectedOrgNode: OrgNodeModel;
    @Input() isEditModeEnabled: boolean;
    @Input() isEditMenuEnable: boolean;
    @Input() orgGroupID: number;
    @Input() isNodeMoveEnabledOrDisabled: boolean;
    @Output() nodeSearched = new EventEmitter<OrgNodeModel>();
    @Output() deleteNode = new EventEmitter<OrgNodeModel>();
    @Output() addNode = new EventEmitter<OrgNodeModel>();
    @Output() chartStructureUpdated = new EventEmitter<any>();
    @Output() updateNode = new EventEmitter<OrgNodeModel>();
    @Output() isSmartBarEnabled = new EventEmitter<boolean>();
    @Output() isNodeMoveDisabled = new EventEmitter<boolean>();
    @Output() moveNode = new EventEmitter<DraggedNode>();

    constructor(private elementRef: ElementRef, private domHelper: DomElementHelper, private renderer: Renderer, private orgService: OrgService) {
        this.searchHeader = `BY ${HeaderTitle}`;
        this.placeholderText = `${AddResource}`;
        this.newOrgNode = new OrgNodeModel();
        this.isSmartBarEnabled.emit(false);
        this.newNodeValue = null;
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["isNodeMoveEnabledOrDisabled"]) {
            if (changes["isNodeMoveEnabledOrDisabled"].currentValue) {
                this.clearSearch();
                this.placeholderText = "Assign to...";
                this.searchTerm = this.multiInTerm = EMPTYSTRING;
                this.setInputFocus();
                this.orgSearchData = new Array<any>();
                this.convertToFlatData(this.treeJsonData);
            } else {
                this.clearSearch();
                this.placeholderText = `${AddResource}`;
                this.setInputFocus();
                this.orgSearchData = new Array<any>();
                this.convertToFlatData(this.treeJsonData);
            }
        }
        if (changes["orgGroupID"]) {
            this.clearSearch();
            this.newNodeValue = null;
            this.multiInTerm = this.searchTerm = EMPTYSTRING;
            this.placeholderText = `${AddResource}`;
            this.isDescriptionText = false;
        }
        if (changes["treeJsonData"]) {
            if (this.treeJsonData) {
                if (!this.newNodeValue && this.newNodeValue !== null) {
                    this.multiInTerm = this.searchTerm = EMPTYSTRING;
                }
                this.orgSearchData = new Array<any>();
                this.convertToFlatData(this.treeJsonData);
            }
        }
        if (changes["selectedOrgNode"]) {
            if (this.selectedOrgNode) {
                if (changes["selectedOrgNode"].previousValue && changes["selectedOrgNode"].previousValue.NodeID !== this.selectedOrgNode.NodeID
                    && this.selectedOrgNode.NodeID !== -1) {
                    this.resetSearch();
                } else {
                    if (this.newNodeValue && this.newNodeValue.length === 1) {
                        this.isSmartBarEnabled.emit(true);
                    }
                    if (!this.isEditMenuEnable && changes["selectedOrgNode"].previousValue === null) {
                        this.isSmartBarEnabled.emit(false);
                        this.clearSearch();
                    }
                }
                this.nodeSearched.emit(null);
            } else {
                this.resetSearch();
                this.nodeSearched.emit(this.selectedOrgNode);
            }
            this.setInputFocus();
        }
    }

    @HostListener("blur", ["$event"])
    onInputFocusOut(event: any) {
        if (this.isNodeMoveEnabledOrDisabled) {
            this.searchTerm = this.multiInTerm = EMPTYSTRING;
            this.isNodeMoveDisabled.emit(false);
            this.isSmartBarEnabled.emit(false);
        }
        setTimeout(() => {
            if (this.selectedOrgNode) {
                this.isTitleSelected = this.searchInProgress = false;
                this.nodeSearchedList = new Array<OrgSearchModel>();
                this.titleFilterList = new Array();
                this.searchHeader = `BY ${HeaderTitle}`;

            } else {
                if (this.searchTerm || this.isSearchEnabled) {
                    this.searchInProgress = this.isSearchEnabled = false;
                    this.nodeSearchedList = new Array<OrgSearchModel>();
                    this.titleFilterList = new Array();
                    this.searchHeader = `BY ${HeaderTitle}`;
                }
                if (this.searchTerm === EMPTYSTRING) {
                    this.isTitleSelected = false;
                }
            }
        }, 250);
    }

    @HostListener("focus", ["$event"])
    onSmartbarFocus() {
        if (this.multiInTerm !== EMPTYSTRING || this.searchTerm !== EMPTYSTRING) {
            let searchTerm = EMPTYSTRING;
            if (this.multiInTerm) {
                searchTerm = this.multiInTerm;
            } else if (this.searchTerm) {
                searchTerm = this.searchTerm;
            }
            if (this.prevSearchTerm === searchTerm) {
                this.prevSearchTerm = searchTerm;
                if (this.isDescriptionText) {
                    this.onDescritptionSearch(searchTerm.toLowerCase());
                } else if (this.isTitleSelected) {
                    this.isSearchEnabled = true;
                    if (!this.exsitingSearchList) {
                        this.exsitingSearchList = new Array<OrgSearchModel>();
                        this.nodeSearchedList.forEach((data) => {
                            this.exsitingSearchList.push(data);
                        });
                    }
                    this.searchTitleList(searchTerm.toLowerCase(), this.exsitingSearchList);
                } else {
                    this.searchList(searchTerm.toLowerCase());
                }
            }
        }
    }

    @HostListener("window:keydown", ["$event"])
    public OnKeyDown(event) {
        let searchContainer;
        if (this.isDescriptionText) {
            searchContainer = TITLE_SEARCH_CONTAINER;
        } else {
            searchContainer = SEARCH_CONTAINER;
        }

        if (this.selectedOrgNode && this.selectedOrgNode.IsStaging) {
            // left arrow
            if ((event as KeyboardEvent).keyCode === 37 && !this.selectedOrgNode.IsNewRoot) {
                this.deleteNode.emit(this.selectedOrgNode);
            }
            // right arrow
            else if ((event as KeyboardEvent).keyCode === 39 && this.selectedOrgNode.children) {
                this.deleteNode.emit(this.selectedOrgNode);
            }
        }

        let curSelected = jQuery(searchContainer).find(`li.${SELECTED}`);
        // top arrow
        if ((event as KeyboardEvent).keyCode === 38) {
            if (this.selectedOrgNode && this.selectedOrgNode.IsStaging && !this.selectedOrgNode.IsNewRoot) {
                this.deleteNode.emit(this.selectedOrgNode);
                return;
            }
            let newSelected = jQuery(searchContainer).find(`li.${SELECTED}`).prev();
            if (this.selectedOrgNode) {
                if (curSelected.hasClass("addNode") && !newSelected.hasClass("addNode")) {
                    newSelected = newSelected.prev();
                }
            } else {
                if (curSelected.hasClass("titleFilter") && !newSelected.hasClass("titleFilter")) {
                    newSelected = newSelected.prev();
                }
            }

            if ((curSelected.hasClass("nodeSearch")) && !newSelected.hasClass("nodeSearch")) {
                newSelected = null;
            }

            if (newSelected && newSelected.hasClass(EMPTYSTRING)) {
                newSelected = null;
            }

            if (newSelected && newSelected[0] && newSelected[0].tagName === "LI") {
                curSelected.removeClass(SELECTED);
                newSelected.addClass(SELECTED);
                jQuery(searchContainer).scrollTop(jQuery(searchContainer).scrollTop() + newSelected.position().top);
            }
        }
        // bottom arrow
        else if ((event as KeyboardEvent).keyCode === 40) {
            let newSelected = jQuery(searchContainer).find(`li.${SELECTED}`).next();
            if (curSelected.hasClass("nodeSearch") && !newSelected.hasClass("nodeSearch")) {
                newSelected = newSelected.next();
            }

            if (this.selectedOrgNode) {
                if (curSelected.hasClass("addNode") && !newSelected.hasClass("addNode")) {
                    newSelected = null;
                }

                if (curSelected.hasClass("titleFilter") && !newSelected.hasClass("titleFilter")) {
                    newSelected = newSelected.next();
                }
            }
            if (newSelected && newSelected.hasClass(EMPTYSTRING)) {
                newSelected = null;
            }
            if (newSelected && newSelected[0] && newSelected[0].tagName === "LI") {
                curSelected.removeClass(SELECTED);
                newSelected.addClass(SELECTED);
                jQuery(searchContainer).scrollTop(jQuery(searchContainer).scrollTop() + newSelected.position().top);
            }
        }
        // esc
        else if ((event as KeyboardEvent).keyCode === 27) {
            if (this.isEditModeEnabled && this.selectedOrgNode) {
                if (this.isNodeMoveEnabledOrDisabled) {
                    this.searchTerm = this.multiInTerm = EMPTYSTRING;
                    this.isNodeMoveDisabled.emit(false);
                    this.isSmartBarEnabled.emit(false);
                    this.clearSearch();
                }

                this.newOrgNode.NodeFirstName =
                    this.newOrgNode.NodeLastName =
                    this.newOrgNode.Description = EMPTYSTRING;

                if (this.selectedOrgNode.IsNewRoot || (this.selectedOrgNode.ParentNodeID && this.selectedOrgNode.NodeID === -1)) {
                    if (this.selectedOrgNode.NodeID === -1) {
                        this.deleteNode.emit(this.selectedOrgNode);
                        this.clearSearch();
                    } else {
                        this.deleteNode.emit(null);
                    }
                } else if (this.multiInTerm !== EMPTYSTRING || (this.newNodeValue && this.newNodeValue.length > 0)) {
                    if (this.selectedOrgNode.NodeID === -1) {
                        this.selectedOrgNode.NodeFirstName =
                            this.selectedOrgNode.NodeLastName =
                            this.selectedOrgNode.Description = EMPTYSTRING;
                    }
                    this.clearSearch();
                }
                this.isDescriptionText = false;
                this.isSmartBarEnabled.emit(false);
                this.isNodeMoveDisabled.emit(false);
                this.newNodeValue = this.titleFilterList = null;
            } else {
                this.resetSearch();
            }
        }
    }

    onEnterKeypress(event) {
        if (this.newNodeValue && this.newNodeValue.length === 0 && !this.multiInTerm) {
            return;
        }
        if (this.isDescriptionText) {
            let element = document.querySelector(`${TITLE_SEARCH_CONTAINER} li.${SELECTED}`);
            if (element) {
                this.renderer.invokeElementMethod(element, "click", []);
                this.multiInTerm = EMPTYSTRING;
            }
            else if (this.isDescriptionselected || (this.newNodeValue && this.newNodeValue.length === 2) || (this.newNodeValue && this.newNodeValue.length <= 2)) {
                this.onAddNode();
            }
        } else {
            let element = document.querySelector(`${SEARCH_CONTAINER} li.${SELECTED}`);
            if (element) {
                this.renderer.invokeElementMethod(element, "click", []);
            }
            this.isSearchEnabled = true;
        }
    }

    onSmartbarBackspacePressed(event) {
        if (this.isNodeMoveEnabledOrDisabled && (this.multiInTerm === EMPTYSTRING || this.multiInTerm.length === 1)) {
            this.searchTerm = this.multiInTerm = EMPTYSTRING;
            this.isNodeMoveDisabled.emit(false);
            this.isSmartBarEnabled.emit(false);
            this.clearSearch();
        }

        if (this.isEditModeEnabled) {
            if (!this.multiInTerm && this.newNodeValue && this.newNodeValue.length > 0) {
                if (this.newNodeValue.length === 1 && this.multiInTerm !== this.prevSearchTerm) {
                    this.isDescriptionText = false;
                } else {
                    this.multiInTerm = this.newNodeValue.pop();
                }
            } else if (!this.multiInTerm && (this.newNodeValue && this.newNodeValue.length === 0)) {
                this.isSmartBarEnabled.emit(false);
                this.isNodeMoveDisabled.emit(false);
                this.multiInTerm = EMPTYSTRING;
                this.newNodeValue = null;
            }
        }
    }

    onSearchBackspacePressed(event) {
        if (!this.searchTerm || this.searchTerm.length === 1) {
            if (!this.searchTerm) {
                this.isTitleSelected = false;
            }
            this.searchInProgress = this.isSearchEnabled = false;
            this.isSmartBarEnabled.emit(false);
            this.isNodeMoveDisabled.emit(false);
            this.nodeSearchedList = new Array<OrgSearchModel>();
            this.titleFilterList = new Array();
            this.searchHeader = `BY ${HeaderTitle}`;
        }
    }

    onAddNode() {
        if (!this.isNodeMoveEnabledOrDisabled) {
            let firstName: any;
            let lastName: any;
            let index = this.multiInTerm.indexOf(" ");
            this.isSmartBarEnabled.emit(true);
            if (index !== -1 && this.multiInTerm && (!this.newNodeValue || this.newNodeValue.length === 0)) {
                firstName = this.multiInTerm.substring(0, index);
                lastName = this.multiInTerm.substring(index + 1, this.multiInTerm.length);
                this.newOrgNode.NodeFirstName = firstName;
                this.newOrgNode.NodeLastName = lastName;
                this.newOrgNode.Description = EMPTYSTRING;
            } else if (index === -1 && this.multiInTerm && (!this.newNodeValue || this.newNodeValue.length === 0)) {
                firstName = this.multiInTerm;
                lastName = EMPTYSTRING;
                this.newOrgNode.NodeFirstName = firstName;
                this.newOrgNode.NodeLastName = lastName;
                this.newOrgNode.Description = EMPTYSTRING;
            }
            this.newOrgNode.OrgGroupID = this.selectedOrgNode.OrgGroupID;
            this.newOrgNode.CompanyID = this.selectedOrgNode.CompanyID;

            if (this.newNodeValue && this.newNodeValue.length >= 1) {
                if (this.newNodeValue.length === 2) {
                    this.newOrgNode.Description = this.newNodeValue[1];
                } else {
                    this.newOrgNode.Description = this.multiInTerm;
                    this.newNodeValue.push(this.multiInTerm);
                }
                if (!this.selectedOrgNode.ParentNodeID && this.selectedOrgNode.NodeID === -1) {
                    if (this.selectedOrgNode.IsNewRoot) {
                        this.newOrgNode.ParentNodeID = null;
                        this.newOrgNode.children = new Array<OrgNodeModel>();
                        this.newOrgNode.children.push(this.selectedOrgNode);
                        this.addNewParentNode(this.newOrgNode);
                    }
                    else {
                        this.newOrgNode.ParentNodeID = null;
                        this.addNewNode(this.newOrgNode);
                    }
                }
                else {
                    if (this.selectedOrgNode.NodeID === -1) {
                        this.newOrgNode.ParentNodeID = this.selectedOrgNode.ParentNodeID;
                    } else {
                        this.newOrgNode.ParentNodeID = this.selectedOrgNode.NodeID;
                    }
                    this.addNewNode(this.newOrgNode);
                }
                this.multiInTerm = EMPTYSTRING;
                this.newNodeValue = null;
            }
            else {
                if (!this.newNodeValue || (this.newNodeValue && this.newNodeValue.length === 0)) {
                    this.newNodeValue = new Array();
                    this.newNodeValue.push(`${firstName} ${lastName}`);
                    this.multiInTerm = EMPTYSTRING;
                    this.isDescriptionText = true;
                    if (this.selectedOrgNode.NodeID !== -1) {
                        this.newOrgNode.NodeID = -1;
                        this.newOrgNode.IsChild = false;
                        this.newOrgNode.IsParent = false;
                        this.newOrgNode.IsSelected = false;
                        this.newOrgNode.IsSibling = true;

                        if (!this.selectedOrgNode.ParentNodeID && this.selectedOrgNode.NodeID === -1) {
                            if (this.selectedOrgNode.IsNewRoot) {
                                this.newOrgNode.ParentNodeID = null;
                                this.newOrgNode.children = new Array<OrgNodeModel>();
                                this.newOrgNode.children.push(this.selectedOrgNode);
                            }
                            else {
                                this.newOrgNode.ParentNodeID = null;
                            }
                        }
                        else {
                            if (this.selectedOrgNode.NodeID === -1) {
                                this.newOrgNode.ParentNodeID = this.selectedOrgNode.ParentNodeID;
                            } else {
                                this.newOrgNode.ParentNodeID = this.selectedOrgNode.NodeID;
                            }
                        }

                        if (!this.newOrgNode.IsStaging && this.newOrgNode.NodeID === -1) {
                            if (this.newNodeValue && this.newNodeValue.length !== 0) {
                                this.newOrgNode.IsStaging = false;
                                this.addNode.emit(this.newOrgNode);
                            }
                        } else {
                            this.updateNode.emit(this.newOrgNode);
                        }
                    }
                } else {
                    this.updateNode.emit(this.newOrgNode);
                    this.newNodeValue.push(`${firstName} ${lastName}`);
                    this.multiInTerm = EMPTYSTRING;
                    this.isDescriptionText = true;
                }
            }
        }
    }

    private addNewParentNode(node: OrgNodeModel) {
        if (!node) { return; }
        // we don"t really need to send any child info to the server at this point
        node.children = null;
        this.orgService.addRootNode(node)
            .subscribe(data => this.emitChartUpdatedNotification(data),
            error => this.handleError(error),
            () => console.log("Added new parent."));
    }

    private emitChartUpdatedNotification(data: OrgNodeModel) {
        if (data) {
            this.chartStructureUpdated.emit(data);
            this.isDescriptionText = false;
            this.isDescriptionselected = false;
            this.isSmartBarEnabled.emit(false);
        }
    }


    private addNewNode(node: OrgNodeModel) {
        if (!node) { return; }
        // we don"t really need to send any child info to the server at this point
        node.children = null;
        this.orgService.addNode(node)
            .subscribe(data => this.emitAddNodeNotification(data),
            error => this.handleError(error),
            () => console.log("Added new node."));
    }

    private emitAddNodeNotification(data: OrgNodeModel) {
        if (data) {
            this.isDescriptionText = false;
            this.isDescriptionselected = false;
            this.isSmartBarEnabled.emit(false);
            this.addNode.emit(data);
        }
    }



    private onInputSearch() {
        if (this.searchTerm) {
            if (!this.isEditMenuEnable) {
                if (this.searchTerm) {
                    this.isSmartBarEnabled.emit(true);
                    this.processSearch(this.searchTerm);
                } else {
                    this.isSmartBarEnabled.emit(false);
                    this.clearSearch();
                }
            } else {
                this.multiInTerm = EMPTYSTRING;
            }
        } else {
            if (!this.isTitleSelected) {
                this.clearSearch();
                this.exsitingSearchList = null;
            } else {
                if (!this.searchTerm && this.searchTerm !== this.prevSearchTerm) {
                    if (!this.prevSearchTerm) {
                        this.clearSearch();
                        this.exsitingSearchList = null;
                        return;
                    }
                    this.processSearch(this.searchTerm);
                    this.prevSearchTerm = this.searchTerm;
                }
            }
        }
    }

    private checkSpaceInName(name) {
        let index = name.indexOf(" ");
        if (index === -1) {
            return false;
        } else {
            return true;
        }
    }

    private onInputMultiSearch(event: Event) {
        if (!this.newNodeValue || (this.newNodeValue && this.newNodeValue.length < 1)) {
            this.placeholderText = `${AddResource}`;
        } else if (this.newNodeValue && this.newNodeValue.length === 1) {
            this.placeholderText = `${AddJobTitle}`;
        } else {
            this.placeholderText = `${SaveData}`;
        }

        if (!this.isEditMenuEnable) {
            if (this.selectedOrgNode && this.selectedOrgNode.NodeID === -1) {
                let islastName = this.checkSpaceInName(this.multiInTerm);
                let index = this.multiInTerm.indexOf(" ");
                if (!this.newNodeValue || this.newNodeValue.length === 0 && this.multiInTerm === EMPTYSTRING) {
                    this.selectedOrgNode.NodeFirstName =
                        this.selectedOrgNode.NodeLastName =
                        this.selectedOrgNode.Description = EMPTYSTRING;

                }
                if (!this.newNodeValue || this.newNodeValue.length === 0) {
                    if (islastName) {
                        this.selectedOrgNode.NodeLastName = this.multiInTerm.substring(index + 1, this.multiInTerm.length);

                        if (this.multiInTerm.substring(0, index) === EMPTYSTRING) {
                            this.multiInTerm = this.multiInTerm.trim();
                            this.selectedOrgNode.NodeFirstName = this.multiInTerm.substring(index, this.multiInTerm.length).trim();
                            this.selectedOrgNode.NodeLastName = EMPTYSTRING;
                        } else {
                            this.selectedOrgNode.NodeFirstName = this.multiInTerm.substring(0, index);
                        }
                    }
                    else {
                        this.selectedOrgNode.NodeFirstName = this.multiInTerm;
                        if (index !== -1) {
                            this.selectedOrgNode.NodeLastName = this.multiInTerm.substring(index + 1, this.multiInTerm.length);
                        } else {
                            this.selectedOrgNode.NodeLastName = EMPTYSTRING;
                        }
                    }
                } else {
                    if (this.newNodeValue.length !== 0 && this.newNodeValue.length < 2) {
                        this.selectedOrgNode.Description = this.multiInTerm;
                    }
                }

                if (this.selectedOrgNode.IsStaging && this.selectedOrgNode.NodeID === -1) {
                    if (this.selectedOrgNode.NodeFirstName || this.selectedOrgNode.NodeLastName) {
                        this.selectedOrgNode.IsStaging = false;
                        this.addNode.emit(this.selectedOrgNode);
                    }
                } else {
                    this.updateNode.emit(this.selectedOrgNode);
                }
            } else if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1 && this.newNodeValue && this.newNodeValue.length !== 0) {
                if (this.newNodeValue.length === 1) {
                    this.newOrgNode.Description = this.multiInTerm;
                }
                this.updateNode.emit(this.newOrgNode);
            } else if (this.newOrgNode && this.newOrgNode.NodeID === -1 && this.newNodeValue && this.newNodeValue.length === 0) {
                let islastName = this.checkSpaceInName(this.multiInTerm);
                let index = this.multiInTerm.indexOf(" ");
                if (!this.newNodeValue || this.newNodeValue.length === 0) {
                    if (islastName) {
                        this.newOrgNode.NodeLastName = this.multiInTerm.substring(index + 1, this.multiInTerm.length);
                    } else {
                        this.newOrgNode.NodeFirstName = this.multiInTerm;
                    }
                }
                this.updateNode.emit(this.newOrgNode);
            }

            if (this.newNodeValue && this.newNodeValue.length === 2) {
                this.multiInTerm = EMPTYSTRING;
                if (!this.isEditModeEnabled) {
                    this.isSmartBarEnabled.emit(true);
                }
            } else if (this.multiInTerm) {
                let searchTerm = this.multiInTerm.trim();
                if (searchTerm) {
                    if (!this.isEditModeEnabled) {
                        this.isSmartBarEnabled.emit(true);
                    }
                    this.processSearch(searchTerm);
                }
            } else {
                if (this.newNodeValue === null || (this.newNodeValue && this.newNodeValue.length === 0)) {
                    if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1) {
                        this.isSmartBarEnabled.emit(false);
                    }
                    this.newNodeValue = null;
                }
                this.clearSearch();
            }
        } else {
            this.multiInTerm = EMPTYSTRING;
        }
    }

    onDescritptionSearch(searchTerm: string) {
        searchTerm = searchTerm.trim();
        this.searchInProgress = true;
        setTimeout(() => {
            this.nodeSearchedList = new Array<OrgSearchModel>();
            this.titleFilterList = new Array();
            this.searchTitleData(searchTerm);
            if (this.selectedOrgNode) {
                setTimeout(() => {
                    let jQueryelement = jQuery(TITLE_SEARCH_CONTAINER).find("li.addNode").addClass(SELECTED);
                    if (jQueryelement) {
                        let position = jQueryelement.position();
                        jQueryelement.scrollTop(jQuery(TITLE_SEARCH_CONTAINER).scrollTop() + (position ? position.top : 0));
                    }
                }, 100);
            } else {
                setTimeout(() => {
                    if (this.titleFilterList.length > 0) {
                        let jQueryelement = jQuery(TITLE_SEARCH_CONTAINER).find("li.titleFilter").first();
                        jQueryelement.addClass(SELECTED).scrollTop(jQuery(TITLE_SEARCH_CONTAINER).scrollTop() + jQueryelement.position().top);
                    }
                }, 100);
            }
        }, 100);
    }

    private processSearch(searchTerm: string) {
        if (this.prevSearchTerm !== searchTerm) {
            this.prevSearchTerm = searchTerm;
            if (this.isDescriptionText) {
                this.onDescritptionSearch(searchTerm.toLowerCase());
            } else if (this.isTitleSelected) {
                this.isSearchEnabled = true;
                if (!this.exsitingSearchList) {
                    this.exsitingSearchList = new Array<OrgSearchModel>();
                    this.nodeSearchedList.forEach((data) => {
                        this.exsitingSearchList.push(data);
                    });
                }
                this.searchTitleList(searchTerm.toLowerCase(), this.exsitingSearchList);
            } else {
                this.searchList(searchTerm.toLowerCase());
            }
        }
    }

    private onNodeSelected(event: any, data: OrgSearchModel) {
        if (data) {
            let node = this.getNode(data.NodeID, this.treeJsonData[0]);
            if (node) {
                jQuery(SEARCH_CONTAINER).find(`li.${SELECTED}`).removeClass(SELECTED);
                let jQueryelement = jQuery(event.target).closest("li.nodeSearch");
                jQueryelement.addClass(SELECTED).scrollTop(jQuery(SEARCH_CONTAINER).scrollTop() + jQueryelement.position().top);
                this.isSmartBarEnabled.emit(false);
                this.clearSearch();
                if (this.isNodeMoveEnabledOrDisabled) {
                    let draggedNode = new DraggedNode();
                    draggedNode.ParentNodeID = node.NodeID;
                    draggedNode.NodeID = this.selectedOrgNode.NodeID;
                    if (draggedNode.ParentNodeID !== this.selectedOrgNode.ParentNodeID) {
                        this.moveNode.emit(draggedNode);
                    }
                    this.isNodeMoveDisabled.emit(false);
                    this.clearSearch();
                    this.isTitleSelected = this.searchInProgress = false;
                    this.nodeSearchedList = new Array<OrgSearchModel>();
                    this.titleFilterList = new Array();
                    this.searchHeader = `BY ${HeaderTitle}`;
                }
                if (this.selectedOrgNode) {
                    if (this.selectedOrgNode.NodeID !== node.NodeID) {
                        this.nodeSearched.emit(node);
                    }
                } else {
                    this.nodeSearched.emit(node);
                }
            }
        }
    }

    private onTitleFilterSelected(event: any, data: any) {
        this.isTitleSelected = true;
        this.titleFilterList = null;
        this.searchHeader = `BY ${data.Name.toUpperCase()}`;
        this.searchList(data.Name.toLowerCase(), true);
        this.prevSearchTerm = this.searchTerm = EMPTYSTRING;
    }

    private selectTitle(event: any, data: any) {
        this.newNodeValue.push(data);
        this.multiInTerm = data;
        if (this.newNodeValue.length === 2 && this.selectedOrgNode.NodeID !== -1) {
            this.newOrgNode.Description = this.newNodeValue[1];
            this.updateNode.emit(this.newOrgNode);
        } else if (this.newNodeValue.length === 2 && this.selectedOrgNode.NodeID === -1) {
            this.selectedOrgNode.Description = this.newNodeValue[1];
            this.updateNode.emit(this.selectedOrgNode);
        }
        this.multiInTerm = EMPTYSTRING;
        this.titleFilterList = null;
        this.isDescriptionselected = true;
    }

    private searchTitleList(searchTerm: string, searchList) {
        searchTerm = searchTerm.trim();
        this.searchInProgress = true;
        setTimeout(() => {
            this.nodeSearchedList = new Array<OrgSearchModel>();
            this.titleFilterList = new Array();
            if (!this.selectedOrgNode || (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1)) {
                searchList.forEach((data, index) => {
                    if (!searchTerm) {
                        this.nodeSearchedList.push(data);
                    } else if (data.Name.toLowerCase().includes(searchTerm)) {
                        this.nodeSearchedList.push(data);
                    }
                });
            }
            setTimeout(() => {
                if (!this.selectedOrgNode && this.nodeSearchedList.length > 0) {
                    let jQueryelement = jQuery(SEARCH_CONTAINER + " li.nodeSearch").first();
                    let position = jQueryelement.position();
                    jQueryelement.addClass("selected").scrollTop(jQuery(SEARCH_CONTAINER).scrollTop() + (position ? position.top : 0));
                }
            }, 100);
        }, 100);
    }

    private searchList(searchTerm: string, isTitleSearch?: boolean) {
        searchTerm = searchTerm.trim();
        this.searchInProgress = true;
        setTimeout(() => {
            this.nodeSearchedList = new Array<OrgSearchModel>();
            this.titleFilterList = new Array();
            if (!this.selectedOrgNode || isTitleSearch || (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1)) {
                this.orgSearchData.forEach((data, index) => {
                    if (isTitleSearch) {
                        if (data.Title.toLowerCase() === searchTerm) {
                            this.nodeSearchedList.push(data);
                        }
                    } else {
                        if (data.Name.toLowerCase().includes(searchTerm)) {
                            this.nodeSearchedList.push(data);
                        }
                    }
                });
            }

            if (this.selectedOrgNode && !this.isNodeMoveEnabledOrDisabled) {
                setTimeout(() => {
                    let jQueryelement = jQuery(SEARCH_CONTAINER + " li.addNode").addClass(SELECTED);
                    if (jQueryelement) {
                        jQuery(SEARCH_CONTAINER).scrollTop(1000);
                    }

                }, 100);
            } else {
                if (!this.isNodeMoveEnabledOrDisabled) {
                    this.searchTitleData(searchTerm);
                }
                setTimeout(() => {
                    if (this.nodeSearchedList.length > 0) {
                        let jQueryelement = jQuery(SEARCH_CONTAINER + " li.nodeSearch").first();
                        let position = jQueryelement.position();
                        jQueryelement.addClass(SELECTED).scrollTop(jQuery(SEARCH_CONTAINER).scrollTop() + (position ? position.top : 0));
                    }
                    else if (this.titleFilterList.length > 0) {
                        let jQueryelement = jQuery(SEARCH_CONTAINER + " li.titleFilter").first();
                        let position = jQueryelement.position();
                        jQueryelement.addClass(SELECTED).scrollTop(jQuery(SEARCH_CONTAINER).scrollTop() + (position ? position.top : 0));
                    }
                }, 100);
            }
        }, 100);
    }

    private searchTitleData(searchTerm: string) {
        if (!this.isTitleSelected) {
            let titleResults = new Array();
            this.orgSearchData.forEach((data, index) => {
                if (data.Title.toLowerCase().includes(searchTerm)) {
                    if (data.NodeID !== -1) {
                        titleResults.push(data);
                    }
                }
            });
            let groups = {};
            for (let i = 0; i < titleResults.length; i++) {
                let title = titleResults[i].Title;
                if (!groups[title]) {
                    groups[title] = [];
                }
                groups[title].push(titleResults[i]);
            }

            for (let title in groups) {
                this.titleFilterList.push({ Name: title, Count: groups[title].length });
            }
        }
    }

    private clearSearch() {
        this.multiInTerm = this.searchTerm = this.prevSearchTerm = EMPTYSTRING;
        this.isTitleSelected = this.searchInProgress = false;
        this.nodeSearchedList = new Array<OrgSearchModel>();
        this.titleFilterList = new Array();
        this.searchHeader = `BY ${HeaderTitle}`;
    }

    private getNode(nodeID: number, rootNode: any) {
        if (rootNode.NodeID === nodeID) {
            return rootNode;
        } else {
            let nodes = rootNode.children ? rootNode.children : rootNode._children;
            if (nodes) {
                let node;
                for (let i = 0; i < nodes.length; i++) {
                    if (!node) {
                        node = this.getNode(nodeID, nodes[i]);
                    }
                };
                return node;
            }
        }
    }

    private setInputFocus() {
        setTimeout(() => {
            let element;
            if (this.selectedOrgNode) {
                if (!this.isEditModeEnabled)
                    element = document.querySelector("input[name=multiInTerm]");
            } else {
                element = document.querySelector("input[name=searchTerm]");
            }
            if (element) {
                this.renderer.invokeElementMethod(element, "focus", []);
            }
        }, 100);
    }

    private convertToFlatData(inputArray, ischild?: boolean) {
        ischild = ischild || false;
        let index = 0, length = inputArray.length;
        for (index = 0; index < length; index++) {
            if (this.isNodeMoveEnabledOrDisabled && this.selectedOrgNode.NodeID === inputArray[index].NodeID) {
                continue;
            }
            let searchModel = new OrgSearchModel();
            searchModel.NodeID = inputArray[index].NodeID;
            searchModel.Title = inputArray[index].Description;
            searchModel.Name = `${inputArray[index].NodeFirstName} ${inputArray[index].NodeLastName}`;
            this.orgSearchData.push(searchModel);

            if (inputArray[index].children && typeof inputArray[index].children === typeof []) {
                this.convertToFlatData(inputArray[index].children, true);
            }
        }
        if (ischild === false) {
            return;
        }
    };

    private resetSearch() {
        this.isSmartBarEnabled.emit(false);
        this.isNodeMoveDisabled.emit(false);
        this.newNodeValue = this.titleFilterList = null;
        this.clearSearch();
    }

    private handleError(err) {
        try {
            let errorMessage = JSON.parse(err._body);
            alert(errorMessage.Message);
        } catch (ex) {
            alert("OOPs!! Something went wrong!! ");
        }
        console.log(err);
    }
}