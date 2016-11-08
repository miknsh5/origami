import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";

import { OrgNodeModel, OrgSearchModel, OrgService, DomElementHelper } from "../shared/index";

const HeaderTitle = "NAME";
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
    private searchTerm: string = "";
    private multiInTerm: string = "";
    private nodeSearchedList: OrgSearchModel[];
    private titleFilterList: any[];
    private newNodeValue: any[];
    private nodeTitleSearchedList: OrgSearchModel[];
    private searchInProgress: boolean = false;
    private isTitleSelected: boolean = false;
    private newOrgNode: OrgNodeModel;
    private isDescriptionText: boolean = false;
    private isDescriptionselected: boolean = false;

    @Input() treeJsonData: any;
    @Input() selectedOrgNode: OrgNodeModel;
    @Input() isEditModeEnabled: boolean;
    @Input() isEditMenuEnable: boolean;
    @Output() nodeSearched = new EventEmitter<OrgNodeModel>();
    @Output() deleteNode = new EventEmitter<OrgNodeModel>();
    @Output() addNode = new EventEmitter<OrgNodeModel>();
    @Output() chartStructureUpdated = new EventEmitter<any>();
    @Output() updateNode = new EventEmitter<OrgNodeModel>();
    @Output() isSmartBarEnabled = new EventEmitter<boolean>();

    constructor(private elementRef: ElementRef, private domHelper: DomElementHelper, private renderer: Renderer, private orgService: OrgService) {
        this.searchHeader = `BY ${HeaderTitle}`;
        this.newOrgNode = new OrgNodeModel();
        this.isSmartBarEnabled.emit(false);
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["treeJsonData"]) {
            if (this.treeJsonData) {
                this.orgSearchData = new Array<any>();
                this.convertToFlatData(this.treeJsonData);
            }
        }
        if (changes["selectedOrgNode"]) {
            if (this.selectedOrgNode === null) {
                this.nodeSearched.emit(this.selectedOrgNode);
            } else {
                this.nodeSearched.emit(null);
            }
            this.setInputFocus();
        }
    }

    convertToFlatData(inputArray, ischild?: boolean) {
        ischild = ischild || false;
        let index = 0, length = inputArray.length;
        for (index = 0; index < length; index++) {
            let searchModel = new OrgSearchModel();
            searchModel.NodeID = inputArray[index].NodeID;
            searchModel.Title = inputArray[index].Description;
            searchModel.Name = inputArray[index].NodeFirstName + " " + inputArray[index].NodeLastName;

            this.orgSearchData.push(searchModel);

            if (inputArray[index].children && typeof inputArray[index].children === typeof []) {
                this.convertToFlatData(inputArray[index].children, true);
            }
        }
        if (ischild === false) {
            return;
        }
    };

    @HostListener("window:keydown", ["$event"])
    public OnKeyDown(event) {
        let searchContainer;
        if (this.isDescriptionText) {
            searchContainer = document.getElementById("titleSearchSelection");
        } else {
            searchContainer = document.getElementById("searchSelection");
        }

        if ((event as KeyboardEvent).keyCode === 38) {
            let jQueryelement = jQuery(searchContainer).find("li.selected").prev();
            if (this.selectedOrgNode) {
                if (jQuery(searchContainer).find("li.selected").hasClass("addNode") && !jQueryelement.hasClass("addNode")) {
                    jQueryelement = jQueryelement.prev();
                }
            } else {
                if (jQuery(searchContainer).find("li.selected").hasClass("titleFilter") && !jQueryelement.hasClass("titleFilter")) {
                    jQueryelement = jQueryelement.prev();
                }
            }

            if (jQuery(searchContainer).find("li.selected").hasClass("nodeSearch") && !jQueryelement.hasClass("nodeSearch")) {
                jQueryelement = null;
            }
            if (jQueryelement && jQueryelement[0] && jQueryelement[0].tagName === "LI") {
                jQuery(searchContainer).find("li.selected").removeClass("selected");
                jQueryelement.addClass("selected");
                jQuery(searchContainer).scrollTop(jQuery(searchContainer).scrollTop() + jQueryelement.position().top);
            }
        }
        else if ((event as KeyboardEvent).keyCode === 40) {
            let jQueryelement = jQuery(searchContainer).find("li.selected").next();
            if (jQuery(searchContainer).find("li.selected").hasClass("nodeSearch") && !jQueryelement.hasClass("nodeSearch")) {
                jQueryelement = jQueryelement.next();
            }

            if (this.selectedOrgNode) {
                if (jQuery(searchContainer).find("li.selected").hasClass("addNode") && !jQueryelement.hasClass("addNode")) {
                    jQueryelement = null;
                }
            } else {
                if (jQuery(searchContainer).find("li.selected").hasClass("titleFilter") && !jQueryelement.hasClass("titleFilter")) {
                    jQueryelement = null;
                }
            }

            if (jQueryelement && jQueryelement[0] && jQueryelement[0].tagName === "LI") {
                if (jQueryelement.hasClass("addNode") || jQueryelement.hasClass("titleFilter") || jQueryelement.hasClass("nodeSearch")) {
                    jQuery(searchContainer).find("li.selected").removeClass("selected");
                    jQueryelement.addClass("selected");
                    jQuery(searchContainer).scrollTop(jQuery(searchContainer).scrollTop() + jQueryelement.position().top);
                }
            }

        } else if ((event as KeyboardEvent).keyCode === 13) {
            if (this.newNodeValue && this.newNodeValue.length === 0 && this.multiInTerm === "") {
                return;
            }
            if (this.isDescriptionText) {
                let element = document.querySelector("#titleSearchSelection li.selected");
                if (element) {
                    this.renderer.invokeElementMethod(element, "click", []);
                    this.multiInTerm = "";
                }
                else if (this.isDescriptionselected || (this.newNodeValue && this.newNodeValue.length === 2) || (this.newNodeValue && this.newNodeValue.length <= 2)) {
                    this.onAddNode();
                }
            } else {
                let element = document.querySelector("#searchSelection li.selected");
                if (element)
                    this.renderer.invokeElementMethod(element, "click", []);
            }
        } else if ((event as KeyboardEvent).keyCode === 27) {
            if (this.isEditModeEnabled && this.selectedOrgNode) {
                if (this.selectedOrgNode.IsNewRoot || (this.selectedOrgNode.ParentNodeID && this.selectedOrgNode.NodeID === -1)) {
                    if (this.selectedOrgNode.NodeID === -1) {
                        this.deleteNode.emit(this.selectedOrgNode);
                        this.isSmartBarEnabled.emit(false);
                        this.newNodeValue = this.titleFilterList = null;
                        this.isDescriptionText = false;
                        this.clearSearch();
                    } else {
                        this.isSmartBarEnabled.emit(false);
                        this.deleteNode.emit(null);
                        this.isDescriptionText = false;
                        this.newNodeValue = this.titleFilterList = null;
                    }
                } else if (this.multiInTerm || (this.newNodeValue && this.newNodeValue.length > 0)) {
                    if (this.selectedOrgNode.NodeID === -1) {
                        this.deleteNode.emit(null);
                    }
                    this.isDescriptionText = false;
                    this.isSmartBarEnabled.emit(false);
                    this.newNodeValue = this.titleFilterList = null;
                    this.clearSearch();
                }
            } else {
                this.newNodeValue = this.titleFilterList = null;
                this.clearSearch();
            }
        } else if ((event as KeyboardEvent).keyCode === 8) {
            if (this.isEditModeEnabled) {
                if (this.multiInTerm === "" && this.newNodeValue && this.newNodeValue.length > 0) {
                    if (this.newNodeValue.length === 1) {
                        this.isDescriptionText = false;
                    }
                    this.multiInTerm = this.newNodeValue.pop();
                } else if (this.multiInTerm === "" && (this.newNodeValue && this.newNodeValue.length === 0)) {
                    this.isSmartBarEnabled.emit(false);
                    this.multiInTerm = "";
                    this.newNodeValue = null;
                }
            }
        }
    }

    onAddNode() {
        let firstName: any;
        let lastName: any;
        let index = this.multiInTerm.indexOf(" ");
        this.isSmartBarEnabled.emit(true);
        if (index !== -1 && this.multiInTerm && (!this.newNodeValue || this.newNodeValue.length === 0)) {
            firstName = this.multiInTerm.substring(0, index);
            lastName = this.multiInTerm.substring(index + 1, this.multiInTerm.length);
            this.newOrgNode.NodeFirstName = firstName;
            this.newOrgNode.NodeLastName = lastName;
            this.newOrgNode.Description = "";
        } else if (index === -1 && this.multiInTerm && (!this.newNodeValue || this.newNodeValue.length === 0)) {
            firstName = this.multiInTerm;
            lastName = "";
            this.newOrgNode.NodeFirstName = firstName;
            this.newOrgNode.NodeLastName = lastName;
            this.newOrgNode.Description = "";
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
            this.multiInTerm = "";
            this.newNodeValue = null;
        }
        else {
            if (!this.newNodeValue) {
                this.newNodeValue = new Array();
                this.newNodeValue.push(firstName + " " + lastName);
                this.multiInTerm = "";
                this.isDescriptionText = true;
                if (this.selectedOrgNode.NodeID !== -1) {
                    this.newOrgNode.NodeID = -1;
                    this.newOrgNode.IsChild = false;
                    this.newOrgNode.IsGrandParent = false;
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
                this.newNodeValue.push(firstName + " " + lastName);
                this.multiInTerm = "";
                this.isDescriptionText = true;
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
            // call emitAddNodeNotification for root node and emitUpdateNodeNotification for children 
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
        if (!this.isEditMenuEnable) {
            if (this.searchTerm) {
                this.isSmartBarEnabled.emit(true);
                this.processSearch(this.searchTerm);
            } else {
                this.isSmartBarEnabled.emit(false);
                this.clearSearch();
            }
        } else {
            this.multiInTerm = "";
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
        if (!this.isEditMenuEnable) {
            if (this.selectedOrgNode && this.selectedOrgNode.NodeID === -1) {
                let islastName = this.checkSpaceInName(this.multiInTerm);
                let index = this.multiInTerm.indexOf(" ");
                if (!this.newNodeValue || this.newNodeValue.length === 0) {
                    if (islastName) {
                        this.selectedOrgNode.NodeLastName = this.multiInTerm.substring(index + 1, this.multiInTerm.length);
                    }
                    else {
                        this.selectedOrgNode.NodeFirstName = this.multiInTerm;
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
            }
            else if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== -1 && this.newNodeValue && this.newNodeValue.length !== 0) {
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
                    }
                    else {
                        this.newOrgNode.NodeFirstName = this.multiInTerm;
                    }
                }
                this.updateNode.emit(this.newOrgNode);
            }


            if (this.newNodeValue && this.newNodeValue.length === 2) {
                this.multiInTerm = "";
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
                if (this.newNodeValue && this.newNodeValue.length === 0) {
                    this.isSmartBarEnabled.emit(false);
                    this.newNodeValue = null;
                }
                this.clearSearch();
            }
        } else {
            this.multiInTerm = "";
        }
    }

    onDescritptionSearch(searchTerm: string) {
        searchTerm = searchTerm.trim();
        this.searchInProgress = true;
        this.nodeSearchedList = new Array<OrgSearchModel>();
        this.titleFilterList = new Array();
        setTimeout(() => {
            this.searchTitleData(searchTerm);
            if (this.selectedOrgNode) {
                setTimeout(() => {
                    let jQueryelement = jQuery("#titleSearchSelection li.addNode").addClass("selected");
                    if (jQueryelement) {
                        let position = jQueryelement.position();
                        jQueryelement.scrollTop(jQuery("#titleSearchSelection").scrollTop() + (position ? position.top : 0));
                    }
                }, 100);
            } else {
                setTimeout(() => {
                    if (this.titleFilterList.length > 0) {
                        let jQueryelement = jQuery("#titleSearchSelection li.titleFilter").first();
                        jQueryelement.addClass("selected").scrollTop(jQuery("#titleSearchSelection").scrollTop() + jQueryelement.position().top);
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
            } else {
                this.searchList(searchTerm.toLowerCase());
            }
        }
    }

    private onNodeSelected(event: any, data: OrgSearchModel) {
        if (data) {
            let node = this.getNode(data.NodeID, this.treeJsonData[0]);
            if (node) {
                jQuery("#searchSelection").find("li.selected").removeClass("selected");
                let jQueryelement = jQuery(event.target).closest("li.nodeSearch");
                jQueryelement.addClass("selected").scrollTop(jQuery("#searchSelection").scrollTop() + jQueryelement.position().top);
                this.isSmartBarEnabled.emit(false);
                this.clearSearch();
                this.nodeSearched.emit(node);
            }
        }
    }

    private onTitleFilterSelected(event: any, data: any) {
        this.isTitleSelected = true;
        this.titleFilterList = null;
        this.searchHeader = `BY ${data.Name.toUpperCase()}`;
        this.searchList(data.Name.toLowerCase(), true);
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
        this.titleFilterList = null;
        this.isDescriptionselected = true;
    }

    private searchList(searchTerm: string, isTitleSearch?: boolean) {
        searchTerm = searchTerm.trim();
        this.searchInProgress = true;
        this.nodeSearchedList = new Array<OrgSearchModel>();
        this.titleFilterList = new Array();
        setTimeout(() => {
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

            if (this.selectedOrgNode) {
                setTimeout(() => {
                    let jQueryelement = jQuery("#searchSelection li.addNode").addClass("selected");
                    if (jQueryelement) {
                        jQuery("#searchSelection").scrollTop(1000);
                    }

                }, 100);
            } else {
                this.searchTitleData(searchTerm);
                setTimeout(() => {
                    if (this.nodeSearchedList.length > 0) {
                        let jQueryelement = jQuery("#searchSelection li.nodeSearch").first();
                        let position = jQueryelement.position();
                        jQueryelement.addClass("selected").scrollTop(jQuery("#searchSelection").scrollTop() + (position ? position.top : 0));
                    }
                    else if (this.titleFilterList.length > 0) {
                        let jQueryelement = jQuery("#searchSelection li.titleFilter").first();
                        let position = jQueryelement.position();
                        jQueryelement.addClass("selected").scrollTop(jQuery("#searchSelection").scrollTop() + (position ? position.top : 0));
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
        this.multiInTerm = this.searchTerm = this.prevSearchTerm = "";
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