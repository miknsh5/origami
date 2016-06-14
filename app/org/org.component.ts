import { Component, Output, EventEmitter} from "@angular/core";
import { HTTP_PROVIDERS } from "@angular/http";
import { CanActivate, Router } from "@angular/router-deprecated";
import { tokenNotExpired } from "angular2-jwt";

import { AddNodeComponent } from "./add-node/add-node.component";
import { OrgNodeDetailComponent } from "./org-node-detail/index";
import { OrgChartModel, OrgNodeModel, OrgService } from "./shared/index";
import { OrgTreeComponent } from "./d3-tree/org-tree.component";


@Component({
    selector: "sg-origami-org",
    directives: [OrgTreeComponent, OrgNodeDetailComponent],
    templateUrl: "app/org/org.component.html",
    styleUrls: ["app/org/org.component.css"],
    providers: [OrgService, HTTP_PROVIDERS]
})

export class OrgComponent {
    orgChart: OrgChartModel;
    orgNodes: OrgNodeModel[];
    svgWidth: number;
    svgHeight: number;

    @Output() treeJson: any;
    @Output() selectedNode: OrgNodeModel;
    @Output() addMode: boolean;

    constructor(private orgService: OrgService, private router: Router) {
        this.getAllNodes();
        // temporary set to fixed height 
        this.svgHeight = 540;

        this.svgWidth = window.innerWidth;
    }

    onResize(event) {
        setTimeout(() => {
            this.svgWidth = window.innerWidth;
        }, 100);
    }

    getAllNodes() {
        this.orgService.getNodes()
            .subscribe(data => this.setOrgChartData(data),
            err => this.orgService.logError(err),
            () => console.log("Random Quote Complete"));
    }

    onNodeSelected(node) {
        this.selectedNode = node;
    }

    onNodeAdded(added: OrgNodeModel) {
        this.addMode = false;
        this.addChildToSelectedOrgNode(added, this.orgNodes[0]);
        this.updateJSON();
    }

    onSwitchedToAddMode(node: OrgNodeModel) {
        this.selectedNode = node;
        this.addMode = true;
    }

    addChildToSelectedOrgNode(newNode: OrgNodeModel, node: OrgNodeModel) {
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
    }

    updateJSON() {
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        // alert(JSON.stringify(this.orgNodes));
    }

    deleteNodeFromArray(nodes: OrgNodeModel[]) {
        let index = - 1;
        for (let i = 0; i < nodes.length; i++) {
            if (this.compareNodeID(nodes[i], this.selectedNode)) {
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
                    this.deleteNodeFromArray(element.children);
                }
            }
        }
    }

    onNodeDeleted(deleted) {
        this.addMode = false;
        this.deleteNodeFromArray(this.orgNodes);
        this.updateJSON();
    }

    onNodeUpdated(selected) {
        this.selectedNode = selected;
        this.updateOrgNode(this.orgNodes[0]);
        this.updateJSON();
    }

    updateOrgNode(node: OrgNodeModel) {
        if (this.compareNodeID(node, this.selectedNode)) {
            node.NodeFirstName = this.selectedNode.NodeFirstName;
            node.NodeLastName = this.selectedNode.NodeLastName;
            node.Description = this.selectedNode.Description;
            node.IsSelected = true;
            return true;
        } else {
            node.IsSelected = false;
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    let result = this.updateOrgNode(node.children[i]);
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
        this.orgNodes = this.orgChart.OrgNodes;
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
    }

}   