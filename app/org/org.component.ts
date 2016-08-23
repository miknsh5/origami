import { Component, Output, EventEmitter, OnDestroy} from "@angular/core";
import { HTTP_PROVIDERS } from "@angular/http";
import { CanActivate, Router } from "@angular/router-deprecated";
import { tokenNotExpired } from "angular2-jwt";

import { AddNodeComponent } from "./add-node/add-node.component";
import { MenuPanelComponent } from "./menu-panel/menu-panel.component";
import { OrgNodeDetailComponent } from "./org-node-detail/index";
import { OrgNodeModel, OrgService, ChartMode, OrgCompanyModel, OrgGroupModel} from "./shared/index";
import { TitleMenuPanelComponent } from "./title-menu-panel/title-menu-panel.component";
import { OrgTreeComponent } from "./d3-tree/org-tree.component";
import { UserModel } from "../Shared/models/user.model";

const MIN_HEIGHT: number = 320;
const MAX_HEIGHT: number = 768;

const MIN_WIDTH: number = 420;
const MAX_WIDTH: number = 1366;

const DEFAULT_OFFSET: number = 70;

declare var $: any;
declare var SVGPan: any;

@Component({
    selector: "sg-origami-org",
    directives: [OrgTreeComponent, OrgNodeDetailComponent, MenuPanelComponent, TitleMenuPanelComponent],
    templateUrl: "app/org/org.component.html",
    styleUrls: ["app/org/org.component.css"],
    providers: [OrgService, HTTP_PROVIDERS]
})

export class OrgComponent implements OnDestroy {
    orgCompanies: OrgCompanyModel[];
    orgCompanyGroup: OrgGroupModel[];
    orgChart: OrgGroupModel;
    orgNodes: OrgNodeModel[];
    svgWidth: number;
    svgHeight: number;
    buildView: any;
    reportView: any;
    buildViewText: any;
    reportViewText: any;
    svgPan: any;
    defaultCompany: OrgCompanyModel;
    defaultGroup: OrgGroupModel;

    @Output() userCompanies: OrgCompanyModel;
    @Output() userModel: UserModel;
    @Output() currentChartMode: ChartMode;
    @Output() treeJson: any;
    @Output() selectedNode: OrgNodeModel;
    @Output() isAddOrEditMode: boolean;
    @Output() detailAddOrEditMode: boolean;
    @Output() displayFirstNameLabel: boolean;
    @Output() displayLastNameLabel: boolean;
    @Output() displayDescriptionLabel: boolean;

    constructor(private orgService: OrgService, private router: Router) {
        this.getAllCompanies();
        this.svgWidth = this.getSvgWidth();
        this.svgHeight = this.getSvgHeight();
        this.currentChartMode = ChartMode.build;
        this.enableLabels();
        this.enableViewModesNav(ChartMode.build);
    }

    enableDropDown() {
        $(".dropdown-button").dropdown({ constrain_width: false, alignment: "right" });
        $(".organization").dropdown({ constrain_width: false, belowOrigin: true, alignment: "left" });
        $(".group").dropdown({ constrain_width: false, belowOrigin: true, alignment: "left" });
    }

    onResize(event) {
        this.svgWidth = this.getSvgWidth();
        this.svgHeight = this.getSvgHeight();
    }

    getAllCompanies() {
        let profile = localStorage.getItem("profile");
        if (profile) {
            this.userModel = JSON.parse(profile);
            console.log(profile);
            this.orgService.getCompanies(profile)
                .subscribe(data => this.setCompanies(data),
                err => this.orgService.logError(err));
        }
    }

    setCompanies(data) {
        if (data) {
            this.orgCompanies = this.userCompanies = data;
            if (this.orgCompanies.length && this.orgCompanies.length <= 1) {
                this.defaultCompany = data[0];
                this.getDefaultGroup(this.defaultCompany.OrgGroups);
            }
            else {
                this.orgCompanies.forEach((element) => {
                    let company: OrgCompanyModel = element;
                    let companyGroups: OrgGroupModel[];
                    if (company.IsDefaultCompany) {
                        this.defaultCompany = company;
                        companyGroups = company.OrgGroups;
                        this.getDefaultGroup(companyGroups);
                    }
                });
            }
        }
    }

    getDefaultGroup(groups) {
        if (groups) {
            this.orgCompanyGroup = groups;
            if (this.orgCompanyGroup.length && this.orgCompanyGroup.length <= 1) {
                this.defaultGroup = groups[0];
                this.getAllNodes(this.defaultGroup.OrgGroupID);
            } else {
                this.orgCompanyGroup.forEach((group) => {
                    this.getAllNodes(this.defaultGroup.OrgGroupID);
                    if (group.IsDefaultGroup) {
                        this.defaultGroup = group;
                        this.getAllNodes(group.OrgGroupID);
                    }
                });
            }
        }
    }

    getAllNodes(groupId) {
        let profile = localStorage.getItem("profile");
        if (profile) {
            this.orgService.getOrgNodes(groupId)
                .subscribe(data => this.setOrgChartData(data),
                err => this.orgService.logError(err),
                () => console.log("Random Quote Complete"));
        }
    }

    enableFirstNameLabel(data) {
        this.displayFirstNameLabel = data;
    }
    enableLastNameLabel(data) {
        this.displayLastNameLabel = data;
    }
    enableDescriptionLabel(data) {
        this.displayDescriptionLabel = data;
    }
    enableLabels() {
        this.displayFirstNameLabel = true;
        this.displayLastNameLabel = true;
        this.displayDescriptionLabel = true;
    }

    changeViewModeNav(viewMode) {
        if (!this.isAddOrEditMode) {
            if (viewMode === ChartMode.build) {
                this.enableLabels();
                this.currentChartMode = ChartMode.build;
                this.enableViewModesNav(ChartMode.build);
                if (this.svgPan) {
                    this.svgPan.enablePan = false;
                }
            } else {
                this.currentChartMode = ChartMode.report;
                this.enableViewModesNav(ChartMode.report);
                this.enableLabels();
                if (!this.svgPan) {
                    let elem = document.getElementsByTagName("svg")[0];
                    this.svgPan = SVGPan(elem, {
                        enablePan: true,
                        enableZoom: false,
                        enableDrag: false,
                        zoomScale: 0
                    });
                } else {
                    this.svgPan.enablePan = true;
                }
            }
        }
    }

    onNodeSelected(node) {
        let prevNode = this.selectedNode ? this.selectedNode : new OrgNodeModel();
        this.selectedNode = node;
        if (this.selectedNode) {
            if (node.NodeID === -1) {
                this.isAddOrEditMode = true;
                this.detailAddOrEditMode = true;
            } else if ((this.isAddOrEditMode || !this.isAddOrEditMode && prevNode.IsNewRoot) && prevNode.NodeID !== node.NodeID) {
                this.isAddOrEditMode = false;
                this.detailAddOrEditMode = false;
            }
        }
    }

    onNodeAdded(addedNode: OrgNodeModel) {
        this.isAddOrEditMode = false;
        if (addedNode.NodeID !== -1) {
            // gets the stagged node and deleting it
            let node = this.getNode(-1, this.orgNodes[0]);
            this.deleteNodeFromArray(node, this.orgNodes);
            this.selectedNode = addedNode;
            this.detailAddOrEditMode = false;
        }
        if (addedNode.IsNewRoot) {
            this.orgNodes.splice(0, 1, addedNode);
        }
        else {
            this.addChildToSelectedOrgNode(addedNode, this.orgNodes[0]);
        }
        this.updateJSON();
    }

    onSwitchedToAddMode(node: OrgNodeModel) {
        this.isAddOrEditMode = true;
        this.detailAddOrEditMode = true;
        this.selectedNode = node;
        this.disableViewModesNav(ChartMode.report);
    }

    onAddOrEditModeValueSet(value: boolean) {
        this.isAddOrEditMode = value;
        this.detailAddOrEditMode = value;
        if (value) {
            this.disableViewModesNav(ChartMode.report);
        } else {
            this.enableViewModesNav(ChartMode.build);
        }
    }

    addChildToSelectedOrgNode(newNode: OrgNodeModel, node: OrgNodeModel) {
        if (node) {
            if (this.comparewithParentNodeID(newNode, node)) {
                newNode.IsSelected = true;
                if (!node.children) {
                    node.children = new Array<OrgNodeModel>();
                }
                node.children.push(newNode);
                return true;
            } else {
                node.IsSelected = false;
                if (node.children) {
                    for (let i = 0; i < node.children.length; i++) {
                        let result = this.addChildToSelectedOrgNode(newNode, node.children[i]);
                        if (result) {
                            break;
                        }
                    }
                }
            }
        } else {
            newNode.IsSelected = true;
            newNode.IsStaging = false;
            newNode.children = new Array<OrgNodeModel>();
            this.orgNodes.push(newNode);
            return true;
        }
    }

    replacer(key, value) {
        if (typeof key === "parent") {
            return undefined;
        }
        return value;
    }

    removeCircularRef(node) {
        if (node) {
            node.parent = null;
            if (node.children == null && node._children != null) {
                node.children = node._children;
            }
            node._children = null;
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    this.removeCircularRef(node.children[i]);
                }
            }
        }
    }

    updateJSON() {
        this.removeCircularRef(this.orgNodes[0]);
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        if ((this.treeJson && this.treeJson.length === 0) || (this.selectedNode && this.selectedNode.NodeID === -1)) {
            this.disableViewModesNav(ChartMode.report);
        }
    }

    deleteNodeFromArray(selectedNode: OrgNodeModel, nodes: OrgNodeModel[]) {
        let index = - 1;
        for (let i = 0; i < nodes.length; i++) {
            if (this.compareNodeID(nodes[i], selectedNode)) {
                index = nodes.indexOf(nodes[i]);
                break;
            }
        };
        if (index > -1) {
            nodes.splice(index, 1);
            this.selectedNode = null;
        } else {
            for (let i = 0; i < nodes.length; i++) {
                let element = nodes[i];
                if (element.children) {
                    this.deleteNodeFromArray(selectedNode, element.children);
                }
            }
        }
    }

    onNodeDeleted(deleted) {
        this.isAddOrEditMode = false;
        this.detailAddOrEditMode = false;
        if (deleted) {
            if (deleted.IsNewRoot) {
                let oldRoot = deleted.children[0];
                oldRoot.ParentNodeID = null;
                this.orgNodes.splice(0, 1, oldRoot);
            }
            else {
                this.deleteNodeFromArray(deleted, this.orgNodes);
            }
        } else {
            let node = this.getNode(this.selectedNode.NodeID, this.orgNodes[0]);
            this.selectedNode = JSON.parse(JSON.stringify(node));
        }
        this.updateJSON();
    }

    onNodeTextChange(selected) {
        if (selected) {
            this.selectedNode = selected;
        }
    }

    onNodeUpdated(selected) {
        // since while updating data to server we send children as null so refreshing the value
        if (selected && !selected.children && selected.NodeID === this.selectedNode.NodeID && this.selectedNode.children) {
            selected.children = this.selectedNode.children;
        }
        if (selected.NodeID !== -1) {
            this.selectedNode = selected;
        }
        if (selected.NodeID !== -1 && selected.IsStaging) {
            // updating local changes
            let nodes = JSON.parse(JSON.stringify(this.orgNodes));
            this.updateOrgNode(nodes[0], selected);
            this.treeJson = JSON.parse(JSON.stringify(nodes));
        } else {
            // updating submitted or saved changes
            this.updateOrgNode(this.orgNodes[0], selected);
            this.updateJSON();
        }
    }

    updateOrgNode(node: OrgNodeModel, selectedNode) {
        if (this.compareNodeID(node, selectedNode)) {
            node.NodeFirstName = selectedNode.NodeFirstName;
            node.NodeLastName = selectedNode.NodeLastName;
            node.Description = selectedNode.Description;
            node.ParentNodeID = selectedNode.ParentNodeID;
            node.IsSelected = true;
            return true;
        } else {
            node.IsSelected = false;
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    let result = this.updateOrgNode(node.children[i], selectedNode);
                    if (result) {
                        break;
                    }
                }
            }
        }
    }

    private enableViewModesNav(viewMode) {
        if (viewMode === ChartMode.build) {
            this.buildView = "active";
            this.reportView = "";
        } else {
            this.buildView = "";
            this.reportView = "active";
        }
    }

    private disableViewModesNav(viewMode) {
        if (viewMode === ChartMode.build) {
            this.buildView = "inactive";
        } else {
            this.reportView = "inactive";
        }
    }

    private getSvgHeight() {
        let height = window.innerHeight;

        // applies min height 
        height = height < MIN_HEIGHT ? MIN_HEIGHT : height;
        // applies max height
        height = height > MAX_HEIGHT ? MAX_HEIGHT : height;

        // temporarily applied wiil be removed after standard and organization mode added
        if (this.svgWidth < 993 && height > MIN_HEIGHT) {
            height = height - DEFAULT_OFFSET;
        } else {
            height = height - DEFAULT_OFFSET;
        }

        return height;
    }

    private getSvgWidth() {
        let width = window.innerWidth;

        // applies min width 
        width = width < MIN_WIDTH ? MIN_WIDTH : width;
        // applies max width 
        width = width > MAX_WIDTH ? MAX_WIDTH : width;

        return width;
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

    private comparewithParentNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        if (updatedNode != null && currentNode != null) {
            return updatedNode.ParentNodeID === currentNode.NodeID;
        } else {
            return false;
        }
    }

    private compareNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        if (updatedNode != null && currentNode != null) {
            return updatedNode.NodeID === currentNode.NodeID;
        } else {
            return false;
        }
    }

    onChartUpdated(data: any) {
        this.setOrgChartData(data);
    }

    private setOrgChartData(data: any) {
        this.orgChart = data;
        this.orgNodes = JSON.parse(JSON.stringify(this.orgChart.OrgNodes));
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        localStorage.setItem("org_id", this.orgChart.CompanyID.toString());
        if (this.treeJson && this.treeJson.length === 0) {
            this.disableViewModesNav(ChartMode.report);
        }
        this.enableDropDown();
    }

    ngOnDestroy() {
        if (this.svgPan) {
            this.svgPan.removeHandlers();
        }
    }

}   