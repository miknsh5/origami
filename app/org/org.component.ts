import { Component, Output, EventEmitter} from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import { CanActivate, Router } from '@angular/router-deprecated';
import { tokenNotExpired } from 'angular2-jwt';

import { OrgNodeDetailComponent } from './org-node-detail/index';
import { OrgChartModel, OrgNodeModel, OrgService } from './shared/index';
import {OrgTree} from './d3-tree/org-tree';
@Component({
    selector: 'origami-org',
    directives: [OrgTree, OrgNodeDetailComponent],
    templateUrl: 'app/org/org.component.html',
    styleUrls: ['app/org/org.component.css'],
    providers: [OrgService, HTTP_PROVIDERS]
})

export class OrgComponent {
    orgChart: OrgChartModel;
    orgNodes: OrgNodeModel[];
      treeJson: any;
    @Output() selectedNode: OrgNodeModel;

    constructor(private orgService: OrgService, private router: Router) {
        this.getAllNodes();
    }

    getAllNodes() {
        this.orgService.getNodes()
            .subscribe(data => this.setOrgChartData(data),
            err => this.orgService.logError(err),
            () => console.log('Random Quote Complete'));
    }

    onNodeSelected(node) {
        this.selectedNode = node;
    }


    onNodeDeleted(deletedNode) {
        let index = this.orgNodes.indexOf(deletedNode, 0);
        if (index > -1) {
            this.orgNodes.splice(index, 1);
            this.selectedNode = null;
        }
        else {
            this.orgNodes.forEach(element => {
                let index = element.children.indexOf(deletedNode, 0);
                if (index > -1) {
                    element.children.splice(index, 1);
                    this.selectedNode = null;
                }
            });
        }
    }

    onNodeUpdated(updatedNode) {
        if (updatedNode) {
            if (this.compareNodeID(updatedNode, this.selectedNode)) {
                let index = this.orgNodes.indexOf(this.selectedNode, 0);
                if (index > -1) {
                    this.selectedNode = updatedNode;
                    this.orgChart.OrgNodes[index] = this.selectedNode;
                    this.setOrgChartData(this.orgChart);
                    this.selectedNode = null;
                }
                else {
                    this.orgNodes.forEach(element => {
                        let index = element.children.indexOf(this.selectedNode, 0);
                        console.log(index);
                        if (index > -1) {
                            this.selectedNode = updatedNode;
                            element.children[index] = this.selectedNode;
                            this.setOrgChartData(this.orgChart);
                            this.selectedNode = null;
                        }
                    });
                }
            }
        }
    }
    private compareNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        return updatedNode.NodeID === currentNode.NodeID;
    }

    private setOrgChartData(data: any) {
        this.orgChart = data;
        this.orgNodes = this.orgChart.OrgNodes;
          this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        console.log(this.orgChart);
    }

    logout() {
        localStorage.removeItem('profile');
        localStorage.removeItem('id_token');
        this.router.navigate(['/Login']);
    }

}   