import { Component, Output, EventEmitter} from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import { CanActivate, Router } from '@angular/router-deprecated';
import { tokenNotExpired } from 'angular2-jwt';

import {AddNodeComponent} from './add-node/add-node.component';
import { OrgNodeDetailComponent } from './org-node-detail/index';
import { OrgChartModel, OrgNodeModel, OrgService } from './shared/index';
import {OrgTree} from './d3-tree/org-tree';
@Component({
    selector: 'origami-org',
    directives: [OrgTree, OrgNodeDetailComponent,AddNodeComponent],
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

 onNodeAdded(added:OrgNodeModel)
    {
      this.addChildToSelectedOrgNode(added,this.orgNodes[0]);
      this.updateJSON();
    }
   
      addChildToSelectedOrgNode(newNode:OrgNodeModel,node:OrgNodeModel)
    {
        if(this.compareNodeID(node,this.selectedNode))
        {
            node.IsSelected= true;
            if(!node.children)
            {
                node.children= new Array<OrgNodeModel>();
                
            }
            newNode.ParentNodeID= node.NodeID;
            node.children.push(newNode);
            
            return;
        }else{
            node.IsSelected= false;
            if(node.children)
            {
            node.children.forEach(element=>this.addChildToSelectedOrgNode(newNode,element));
            }
        }
    }
 updateJSON()
    {
             this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
            // alert(JSON.stringify(this.orgNodes));
    }
    
     deleteNodeFromArray(nodes:OrgNodeModel[])
   {
       let index=-1;
         nodes.forEach(element => {
             if(this.compareNodeID(element,this.selectedNode))
             {
                 index= nodes.indexOf(element);
                 
             }
         });
        if (index > -1) {
            nodes.splice(index, 1);
            this.selectedNode = null;
            
        }
        else{
            for (var i = 0; i < nodes.length; i++) {
                var element = nodes[i];
                if(element.children)
                {
                    this.deleteNodeFromArray(element.children);
                }
                
            }
        }
   
   }


    onNodeDeleted(deleted) {

     this.deleteNodeFromArray(this.orgNodes);
       
        this.updateJSON();
    }
     onNodeUpdated(selected)
    {
      this.selectedNode= selected;
     this.updateOrgNode(this.orgNodes[0]);
      
      this.updateJSON();
    }
    
     updateOrgNode(node:OrgNodeModel)
    {
        if(this.compareNodeID(node,this.selectedNode))
        {
            node.NodeFirstName=this.selectedNode.NodeFirstName;
            node.IsSelected=true;
            return;
        }else{
            node.IsSelected= false;
            if(node.children)
            {
            node.children.forEach(element=>this.updateOrgNode(element));
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
       // console.log(this.orgChart);
    }

    logout() {
        localStorage.removeItem('profile');
        localStorage.removeItem('id_token');
        this.router.navigate(['/Login']);
    }

}   