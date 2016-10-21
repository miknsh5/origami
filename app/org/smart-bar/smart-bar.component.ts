import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener, Renderer } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";

import { OrgNodeModel, OrgSearchModel, OrgService, DomElementHelper } from "../shared/index";

const HeaderTitle = "NAME";
declare let $;

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
    private nodeTitleSearchedList: OrgSearchModel[];
    private searchInProgress: boolean = false;
    private isTitleSelected: boolean = false;

    @Input() treeJson: any;
    @Input() selectedOrgNode: OrgNodeModel;
    @Input() isAddOrEditModeEnabled: boolean;
    @Output() nodeSearched = new EventEmitter<OrgNodeModel>();
    @Output() deleteNode = new EventEmitter<OrgNodeModel>();
    @Output() addNode = new EventEmitter<OrgNodeModel>();
    @Output() setAddOrEditModeValue = new EventEmitter<boolean>();
    @Output() chartStructureUpdated = new EventEmitter<any>();

    constructor(private elementRef: ElementRef, private domHelper: DomElementHelper, private renderer: Renderer) {
        this.searchHeader = `BY ${HeaderTitle}`;
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["treeJson"]) {
            if (this.treeJson) {
                this.orgSearchData = new Array<any>();
                this.convertToFlatData(this.treeJson);
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
        this.clearSearch();
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
        let searchContainer = document.getElementById("searchSelection");
        if ((event as KeyboardEvent).keyCode === 38) {
            let element;
            if (this.selectedOrgNode) {

            } else {
                element = $(searchContainer).find("li.active").prev();
                if ($(searchContainer).find("li.active").hasClass("titleFilter") && !$(element).hasClass("titleFilter")) {
                    element = $(element).prev();
                }
            }

            if ($(searchContainer).find("li.active").hasClass("nodeSearch") && !$(element).hasClass("nodeSearch")) {
                element = null;
            }
            if (element && element[0] && element[0].tagName === "LI") {
                $(searchContainer).find("li.active").removeClass("active");
                $(element).addClass("active");
            }
        }
        else if ((event as KeyboardEvent).keyCode === 40) {
            let element = $(searchContainer).find("li.active").next();
            if ($(searchContainer).find("li.active").hasClass("nodeSearch") && !$(element).hasClass("nodeSearch")) {
                element = $(element).next();
            }

            if (this.selectedOrgNode) {

            } else {
                if ($(searchContainer).find("li.active").hasClass("titleFilter") && !$(element).hasClass("titleFilter")) {
                    element = null;
                }
            }

            if (element && element[0] && element[0].tagName === "LI") {
                $(searchContainer).find("li.active").removeClass("active");
                $(element).addClass("active");
            }

        } else if ((event as KeyboardEvent).keyCode === 13) {
            if (!this.selectedOrgNode) {
                let element = document.querySelector("#searchSelection li.active");
                if (element)
                    this.renderer.invokeElementMethod(element, "click", []);
            }
        } else if ((event as KeyboardEvent).keyCode === 27) {
            if (this.isAddOrEditModeEnabled) {
                if (this.selectedOrgNode.IsNewRoot || (this.selectedOrgNode.ParentNodeID && this.selectedOrgNode.NodeID === -1)) {
                    if (this.selectedOrgNode.NodeID === -1) {
                        this.deleteNode.emit(this.selectedOrgNode);
                        this.setAddOrEditModeValue.emit(false);
                    } else {
                        this.setAddOrEditModeValue.emit(false);
                        this.deleteNode.emit(null);
                    }
                }
            }
        }
    }

    private onInputSearch() {
        if (this.searchTerm) {
            if (this.prevSearchTerm !== this.searchTerm) {
                this.prevSearchTerm = this.searchTerm;
                if (this.selectedOrgNode === null) {
                    this.searchList(this.searchTerm.toLowerCase());
                }
            }
        } else {
            this.clearSearch();
        }
    }

    private onInputMultiSearch() {
        if (this.multiInTerm) {
            if (this.prevSearchTerm !== this.multiInTerm) {
                this.prevSearchTerm = this.multiInTerm;
                if (this.selectedOrgNode === null) {
                    this.searchList(this.multiInTerm.toLowerCase());
                }
            }
        } else {
            this.clearSearch();
        }
    }

    private onNodeSelected(event: any, data: OrgSearchModel) {
        if (data) {
            let node = this.getNode(data.NodeID, this.treeJson[0]);
            if (node) {
                $("#searchSelection").find("li.active").removeClass("active");
                $(event.target).closest("li.nodeSearch").addClass("active");
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

    private searchList(searchTerm: string, isTitleSearch?: boolean) {
        this.searchInProgress = true;
        this.nodeSearchedList = new Array<OrgSearchModel>();
        this.titleFilterList = new Array();
        setTimeout(() => {
            this.orgSearchData.forEach((data, index) => {
                if (isTitleSearch) {
                    if (data.Title.toLowerCase() === searchTerm) {
                        this.nodeSearchedList.push(data);
                    }
                } else {
                    if (data.Name.toLowerCase().search(searchTerm) > -1) {
                        this.nodeSearchedList.push(data);
                    }
                }
            });

            if (this.selectedOrgNode) {

            } else {
                this.searchTitleData(searchTerm);
                setTimeout(() => {
                    if (this.nodeSearchedList.length > 0) {
                        $("#searchSelection li.nodeSearch").first().addClass("active");
                    }
                    else if (this.titleFilterList.length > 0) {
                        $("#searchSelection li.titleFilter").first().addClass("active");
                    }
                }, 100);
            }

        }, 100);
    }

    private searchTitleData(searchTerm: string) {
        if (!this.isTitleSelected) {
            let titleResults = new Array();
            this.orgSearchData.forEach((data, index) => {
                if (data.Title.toLowerCase().search(searchTerm) > -1) {
                    titleResults.push(data);
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
                element = document.querySelector("input[name=multiInTerm]");
            } else {
                element = document.querySelector("input[name=searchTerm]");
            }
            if (element) {
                this.renderer.invokeElementMethod(element, "focus", []);
            }
        }, 100);
    }
}