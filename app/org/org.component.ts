import { Component, Output, EventEmitter, OnDestroy} from "@angular/core";
import { HTTP_PROVIDERS } from "@angular/http";
import { CanActivate } from "@angular/router-deprecated";
import { tokenNotExpired } from "angular2-jwt";

import { SideMenuComponent } from "./side-menu-panel/index";
import { OrgNodeDetailComponent } from "./org-node-detail/index";
import { MenuPanelComponent } from "./menu-panel/index";
import { OrgTreeComponent } from "./d3-tree/index";

import { OrgNodeModel, ChartMode, OrgCompanyModel, OrgGroupModel, OrgService} from "./shared/index";

const MIN_HEIGHT: number = 320;
const MAX_HEIGHT: number = 768;

const MIN_WIDTH: number = 420;
const MAX_WIDTH: number = 1366;

const DEFAULT_OFFSET: number = 70;

declare var SVGPan: any;

@Component({
    selector: "sg-origami-org",
    directives: [OrgTreeComponent, OrgNodeDetailComponent, MenuPanelComponent, SideMenuComponent],
    templateUrl: "app/org/org.component.html",
    styleUrls: ["app/org/org.component.css"],
    providers: [OrgService, HTTP_PROVIDERS]
})

export class OrgComponent implements OnDestroy {
    orgNodes: OrgNodeModel[];
    svgWidth: number;
    svgHeight: number;
    buildView: any;
    reportView: any;
    buildViewText: any;
    reportViewText: any;
    svgPan: any;

    @Output() groupID: any;
    @Output() companyID: any;
    @Output() currentChartMode: ChartMode;
    @Output() treeJson: any;
    @Output() orgGroup: OrgGroupModel;
    @Output() companyName: any;
    @Output() selectedNode: OrgNodeModel;
    @Output() isAddOrEditMode: boolean;
    @Output() detailAddOrEditMode: boolean;
    @Output() displayFirstNameLabel: boolean;
    @Output() displayLastNameLabel: boolean;
    @Output() displayDescriptionLabel: boolean;
    @Output() isOrgNodeEmpty: boolean;

    constructor() {
        this.currentChartMode = ChartMode.build;
        this.enableLabels();
        this.svgWidth = this.getSvgWidth();
        this.svgHeight = this.getSvgHeight();
    }

    onResize(event) {
        this.svgWidth = this.getSvgWidth();
        this.svgHeight = this.getSvgHeight();
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
        this.isOrgNodeEmpty = true;
        if (addedNode.NodeID !== -1) {
            // gets the stagged node and deleting it
            let node = this.getNode(-1, this.orgNodes[0]);
            this.deleteNodeFromArray(node, this.orgNodes);
            this.selectedNode = addedNode;
            this.detailAddOrEditMode = false;
            this.isOrgNodeEmpty = false;
        }
        if (addedNode.IsNewRoot) {
            this.orgNodes.splice(0, 1, addedNode);
            this.isOrgNodeEmpty = false;
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
        this.orgGroup.OrgNodes = JSON.parse(JSON.stringify(this.orgNodes));
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
        if (this.orgNodes && this.orgNodes.length === 0) {
            this.isOrgNodeEmpty = true;
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
        this.onGroupSelected(data);
    }

    onGroupSelected(data: any) {
        this.orgGroup = data;
        this.orgNodes = JSON.parse(JSON.stringify(this.orgGroup.OrgNodes));
        this.companyID = this.orgGroup.CompanyID;
        if (this.groupID !== this.orgGroup.OrgGroupID)
            this.groupID = this.orgGroup.OrgGroupID;
        if (this.orgNodes && this.orgNodes.length === 0) {
            this.disableViewModesNav(ChartMode.report);
            this.currentChartMode = ChartMode.build;
        }
        this.enableViewModesNav(this.currentChartMode);
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
    }

    onCompanySelected(data: any) {
        if (data) {
            this.companyName = data.CompanyName;
        }
    }

    ngOnDestroy() {
        if (this.svgPan) {
            this.svgPan.removeHandlers();
        }
    }

}   