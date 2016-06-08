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
    isAddOrEditMode: boolean;

    @Output() treeJson: any;
    @Output() selectedNode: OrgNodeModel;

    constructor(private orgService: OrgService, private router: Router) {
        this.getAllNodes();
    }

    getAllNodes() {
        this.orgService.getNodes()
            .subscribe(data => this.setOrgChartData(data),
            err => this.orgService.logError(err),
            () => console.log("Random Quote Complete"));
    }

    onNodeSelected(node) {
        this.selectedNode = node;
        if (node.NodeID === -1) {
            this.isAddOrEditMode = true;
        }
    }

    onNodeAdded(added: OrgNodeModel) {
        this.isAddOrEditMode = true;
        this.addChildToSelectedOrgNode(added, this.orgNodes[0]);
        this.updateJSON();
    }

    onSwitchedToAddMode(node: OrgNodeModel) {
        this.selectedNode = node;
        this.isAddOrEditMode = true;
    }

    onAddOrEditModeValueSet(value: boolean) {
        this.isAddOrEditMode = value;
    }

    addChildToSelectedOrgNode(newNode: OrgNodeModel, node: OrgNodeModel) {
        if (this.comparewithParentNodeID(newNode, node)) {
            newNode.IsSelected = true;
            if (!node.children) {
                node.children = new Array<OrgNodeModel>();
            }
            node.children.push(newNode);
            return;
        } else {
            node.IsSelected = false;
            if (node.children) {
                node.children.forEach(element => this.addChildToSelectedOrgNode(newNode, element));
            }
        }
    }

    updateJSON() {
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        // alert(JSON.stringify(this.orgNodes));
    }

    deleteNodeFromArray(nodes: OrgNodeModel[]) {
        let index = - 1;
        nodes.forEach(element => {
            if (this.compareNodeID(element, this.selectedNode)) {
                index = nodes.indexOf(element);
            }
        });
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
        this.isAddOrEditMode = false;
        this.deleteNodeFromArray(this.orgNodes);
        this.updateJSON();
    }

    onNodeUpdated(selected) {
        this.isAddOrEditMode = false;
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
            return;
        } else {
            node.IsSelected = false;
            if (node.children) {
                node.children.forEach(element => this.updateOrgNode(element));
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