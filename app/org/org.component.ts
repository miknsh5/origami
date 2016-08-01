import { Component, Output, EventEmitter} from "@angular/core";
import { HTTP_PROVIDERS } from "@angular/http";
import { CanActivate, Router } from "@angular/router-deprecated";
import { tokenNotExpired } from "angular2-jwt";

import { AddNodeComponent } from "./add-node/add-node.component";
import { ConvertJSONToCSV } from "./convertJSONToCSV/convertJSONToCSV.component";
import { ConvertTreeToPNG } from "./convertTreeToPNG/convertTreeToPNG.component";
import { OrgNodeDetailComponent } from "./org-node-detail/index";
import { OrgChartModel, OrgNodeModel, OrgService, ChartMode} from "./shared/index";
import { OrgTreeComponent } from "./d3-tree/org-tree.component";

const MIN_HEIGHT: number = 320;
const MAX_HEIGHT: number = 768;

const MIN_WIDTH: number = 420;
const MAX_WIDTH: number = 1366;

const DEFAULT_OFFSET: number = 5;
const AUTHPANEL_OFFSET: number = 75;

@Component({
    selector: "sg-origami-org",
    directives: [OrgTreeComponent, OrgNodeDetailComponent, ConvertJSONToCSV, ConvertTreeToPNG],
    templateUrl: "app/org/org.component.html",
    styleUrls: ["app/org/org.component.css"],
    providers: [OrgService, HTTP_PROVIDERS]
})

export class OrgComponent {
    orgChart: OrgChartModel;
    orgNodes: OrgNodeModel[];
    svgWidth: number;
    svgHeight: number;



    @Output() currentChartMode: ChartMode;
    @Output() treeJson: any;
    @Output() selectedNode: OrgNodeModel;
    @Output() isAddOrEditMode: boolean;
    @Output() detailAddOrEditMode: boolean;

    constructor(private orgService: OrgService, private router: Router) {
        this.getAllNodes();
        this.svgWidth = this.getSvgWidth();
        this.svgHeight = this.getSvgHeight();
        this.currentChartMode = ChartMode.build;
    }

    onResize(event) {
        this.svgWidth = this.getSvgWidth();
        this.svgHeight = this.getSvgHeight();
    }

    getAllNodes() {
        let profile = localStorage.getItem("profile");
        if (profile) {
            this.orgService.getNodes(profile)
                .subscribe(data => this.setOrgChartData(data),
                err => this.orgService.logError(err),
                () => console.log("Random Quote Complete"));
        }
    }
    changeToBuildMode() {
        this.currentChartMode = ChartMode.build;
    }
    changeToReportMode() {
        this.currentChartMode = ChartMode.report;
    }

    onNodeSelected(node) {
        let nodeID = this.selectedNode ? this.selectedNode.NodeID : 0;
        this.selectedNode = node;
        if (this.selectedNode) {
            if (node.NodeID === -1) {
                this.isAddOrEditMode = true;
                this.detailAddOrEditMode = true;
            } else if (!this.isAddOrEditMode && nodeID !== node.NodeID && nodeID === -1) {
                this.isAddOrEditMode = true;
                this.detailAddOrEditMode = true;
            } else if (this.isAddOrEditMode && nodeID !== node.NodeID) {
                this.isAddOrEditMode = false;
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
        } this.updateJSON();
    }

    onSwitchedToAddMode(node: OrgNodeModel) {
        this.isAddOrEditMode = true;
        this.detailAddOrEditMode = true;
        this.selectedNode = node;
    }

    onAddOrEditModeValueSet(value: boolean) {
        this.isAddOrEditMode = value;
        this.detailAddOrEditMode = value;
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
    updateJSON() {
        this.removeCircularRef(this.orgNodes[0]);
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        // alert(JSON.stringify(this.orgNodes));
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
                this.orgNodes.splice(0, 1, oldRoot);
            }
            else {
                this.deleteNodeFromArray(deleted, this.orgNodes);
            }
        } else {
            this.selectedNode = this.getNode(this.selectedNode.NodeID, this.orgNodes[0]);
        }
        this.updateJSON();
    }

    onNodeUpdated(selected) {
        if (selected.NodeID !== -1) {
            this.selectedNode = selected;
        }
        if (selected.NodeID !== -1 && selected.IsStaging) {
            // updating local changes
            let nodes = JSON.parse(JSON.stringify(this.orgNodes));
            this.updateOrgNode(nodes[0], selected);
            this.treeJson = nodes;
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

    logout() {
        localStorage.removeItem("profile");
        localStorage.removeItem("id_token");
        this.router.navigate(["/Login"]);
    }

    private getSvgHeight() {
        let height = window.innerHeight;

        // applies min height 
        height = height < MIN_HEIGHT ? MIN_HEIGHT : height;
        // applies max height
        height = height > MAX_HEIGHT ? MAX_HEIGHT : height;

        // temporarily applied wiil be removed after standard and organization mode added
        if (this.svgWidth < 993 && height > MIN_HEIGHT) {
            height = height - AUTHPANEL_OFFSET;
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

    private setOrgChartData(data: any) {
        this.orgChart = data;
        this.orgNodes = JSON.parse(JSON.stringify(this.orgChart.OrgNodes));
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        localStorage.setItem("org_id", this.orgChart.OrgID.toString());
    }

}   